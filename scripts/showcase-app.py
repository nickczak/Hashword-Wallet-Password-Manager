#!/usr/bin/env python3
"""Record the real Hashword TUI in a PTY and export a looping showcase.

Setup: uv pip install --target /tmp/hashword-showcase-deps pyte pillow
Run:   npm run build && npm run showcase -- --gif
Uses only the app's built-in example data; no credentials or services needed.
"""
import codecs
import fcntl
import os
from pathlib import Path
import pty
import select
import signal
import struct
import subprocess
import sys
import termios
import time

sys.path.insert(0, '/tmp/hashword-showcase-deps')
import pyte
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'hashword' / 'screenshots'
COLS, ROWS = 110, 32
CW, CH = 10, 21
FPS = 8
BG = '#000000'
FONT = ImageFont.truetype(subprocess.check_output(
    ['fc-match', 'monospace', '-f', '%{file}'], text=True), 16)
COLORS = dict(black='#000000', red='#ef6767', green='#39ff14',
              brown='#d7ba7d', blue='#6797ef', magenta='#c792ea',
              cyan='#71d5ce', white='#e1e6e2', brightblack='#737d77',
              brightwhite='#ffffff', default='#d6ddd7')


def color(value, background=False):
    if value == 'default':
        return BG if background else COLORS['default']
    return COLORS.get(value, '#' + value if len(value) == 6 else COLORS['default'])


def main():
    if not (ROOT / 'hashword/dist/index.js').exists():
        raise SystemExit('Run npm run build first.')
    OUT.mkdir(parents=True, exist_ok=True)
    screen = pyte.Screen(COLS, ROWS)
    stream = pyte.Stream(screen)
    decoder = codecs.getincrementaldecoder('utf-8')('replace')
    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', ROWS, COLS, 0, 0))
    child = subprocess.Popen(['node', 'dist/index.js'], cwd=ROOT / 'hashword',
        stdin=slave, stdout=slave, stderr=slave, start_new_session=True,
        env={**os.environ, 'TERM': 'xterm-256color', 'FORCE_COLOR': '3'})
    os.close(slave)
    frames = []
    caption = 'Unlock your vault'

    def frame():
        image = Image.new('RGB', (COLS * CW + 48, ROWS * CH + 94), BG)
        draw = ImageDraw.Draw(image)
        draw.rounded_rectangle((12, 10, image.width - 12, 46), radius=8, fill='#202822')
        draw.text((27, 18), 'hashword  /  terminal preview', font=FONT, fill='#39ff14')
        for y in range(ROWS):
            for x, cell in screen.buffer[y].items():
                if x >= COLS:
                    continue
                fg, bg = color(cell.fg), color(cell.bg, True)
                if cell.reverse:
                    fg, bg = bg, fg
                px, py = 24 + x * CW, 58 + y * CH
                if bg != BG:
                    draw.rectangle((px, py, px + CW, py + CH), fill=bg)
                draw.text((px, py), cell.data, font=FONT, fill=fg)
        draw.text((24, image.height - 28), caption, font=FONT, fill='#8f9e94')
        frames.append(image)

    def hold(seconds):
        until = time.monotonic() + seconds
        while time.monotonic() < until:
            tick = time.monotonic()
            while select.select([master], [], [], 0)[0]:
                try:
                    data = os.read(master, 65536)
                except OSError:
                    data = b''
                if not data:
                    raise RuntimeError('App exited during the tour')
                stream.feed(decoder.decode(data))
            frame()
            time.sleep(max(0, 1 / FPS - (time.monotonic() - tick)))

    def step(label, keys='', seconds=1.5, expected=None):
        nonlocal caption
        caption = label
        if keys:
            os.write(master, keys.encode())
        hold(seconds)
        if expected and not any(expected in line for line in screen.display):
            raise RuntimeError(f'{label}: expected {expected!r} in terminal')
        frames[-1].save(OUT / (label.split(' · ')[0].lower().replace(' ', '-') + '.png'))
        print('✓', label, flush=True)

    def type_text(text):
        for char in text:
            os.write(master, char.encode())
            hold(.125)

    try:
        step('01 · Unlock your vault', seconds=2, expected='master key')
        type_text('password')
        step('02 · Browse saved passwords', '\r', expected='Example email account')
        step('03 · Inspect a login', '\r', expected='Username')
        os.write(master, b'j')
        hold(.25)
        os.write(master, b'j')
        hold(.25)
        step('04 · Authenticate before revealing a secret', '\r', expected='Enter your master key')
        type_text('password')
        step('05 · Reveal the example password', '\r', expected='example-only')
        step('06 · Hide the secret again', '\r', expected='••••••••')
        os.write(master, b'k')
        hold(.25)
        os.write(master, b'k')
        hold(.25)
        step('07 · Edit a username', 'i', expected='editing')
        for _ in 'alex@example.com':
            os.write(master, b'\x7f')
            hold(.125)
        type_text('alex-demo')
        step('08 · Save your changes', '\r', expected='alex-demo')
        step('09 · Browse another login', '\x1b', seconds=.5)
        step('10 · Source control credentials', 'j', expected='alex-dev')
        step('11 · Explore wallets', 'w', expected='Example primary wallet')
        step('12 · Wallet details', '\r', expected='Hardware wallet')
        step('13 · Account settings', 'a', expected='alex-example')
        step('14 · Lock the vault', '\x0c', seconds=2, expected='master key')
        output = OUT / 'showcase-desktop.gif'
        frames[0].save(output, save_all=True, append_images=frames[1:],
                       duration=1000 // FPS, loop=0, optimize=True)
        print(f'Done: {output}')
    finally:
        os.killpg(child.pid, signal.SIGTERM)
        child.wait(timeout=5)
        os.close(master)


if __name__ == '__main__':
    main()
