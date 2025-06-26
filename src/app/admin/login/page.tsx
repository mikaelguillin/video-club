"use client";
import { useState } from "react";
import { Box, Button, Stack, Heading, Input, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/admin/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  };

  return (
    <Box
      maxW="sm"
      mx="auto"
      mt={24}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Heading mb={6} size="lg">
        Admin Login
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap={4} alignItems="stretch">
          <Box>
            <label htmlFor="username">Username</label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>
          <Box>
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit" colorScheme="blue" w="full">
            Login
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
