import { Box, Text } from "ink";

interface LoginPageProps {
  banner: string;
  showBanner: boolean;
  enteredPassword: string;
}

export default function LoginPage({ banner, showBanner, enteredPassword }: LoginPageProps) {
  return (
    <Box flexGrow={1} flexBasis={0} flexDirection="column" alignItems="center" justifyContent="center" paddingX={1}>
      {showBanner && (
        <Box marginBottom={1.5}>
          <Text color="#39FF14">{banner}</Text>
        </Box>
      )}
      <Text dimColor>wallet &amp; password manager</Text>
      <Box marginTop={2} width={40} borderStyle="single" borderColor="gray" paddingX={1}>
        <Box width={10} flexShrink={0}><Text color="#39FF14">Password:</Text></Box>
        <Box width={26} flexShrink={0}>
          {enteredPassword ? (
            <>
              <Text color="#39FF14">{"•".repeat(Math.min(enteredPassword.length, 25))}</Text>
              <Text color="black" backgroundColor="#39FF14"> </Text>
            </>
          ) : (
            <>
              <Text color="black" backgroundColor="#39FF14"> </Text>
              <Text dimColor>master key</Text>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
