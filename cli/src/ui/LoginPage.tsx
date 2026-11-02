import { Box, Text } from "ink";

export type LoginField = "username" | "email" | "password";

interface LoginPageProps {
  banner: string;
  showBanner: boolean;
  enteredPassword: string;
  username: string;
  email: string;
  creating: boolean;
  loading: boolean;
  field: LoginField;
  message?: string;
}

export default function LoginPage({ banner, showBanner, enteredPassword, username, email, creating, loading, field, message }: LoginPageProps) {
  const fields: { name: LoginField; label: string; value: string; placeholder?: string }[] = [
    { name: "username", label: "Username:", value: username },
    ...(creating ? [{ name: "email" as const, label: "Email:", value: email }] : []),
    { name: "password", label: "Password:", value: "•".repeat(Math.min(enteredPassword.length, 25)), placeholder: "account password" },
  ];

  return (
    <Box flexGrow={1} flexBasis={0} flexDirection="column" alignItems="center" justifyContent="center" paddingX={1}>
      {showBanner && (
        <Box marginBottom={1.5}>
          <Text color="#39FF14">{banner}</Text>
        </Box>
      )}
      <Text dimColor>wallet &amp; password manager</Text>
      <Text color="#39FF14">{creating ? "Create account" : "Sign in"}</Text>
      {fields.map((item) => (
        <Box key={item.name} marginTop={1} width={40} borderStyle="single" borderColor={field === item.name ? "#39FF14" : "gray"} paddingX={1}>
          <Box width={10} flexShrink={0}><Text color="#39FF14">{item.label}</Text></Box>
          <Box width={26} flexShrink={0}>
            <Text color="#39FF14">{item.value.slice(-25)}</Text>
            {!loading && field === item.name && <Text color="black" backgroundColor="#39FF14"> </Text>}
            {!item.value && item.placeholder && <Text dimColor>{item.placeholder}</Text>}
          </Box>
        </Box>
      ))}
      {creating && <Text dimColor>Password: at least 12 characters</Text>}
      <Box marginTop={1}>
        <Text><Text color="#39FF14">ctrl+r</Text><Text dimColor> {creating ? "back to sign in" : "register a new account"}</Text></Text>
      </Box>
      {message && <Box marginTop={1}><Text dimColor>{message}</Text></Box>}
    </Box>
  );
}
