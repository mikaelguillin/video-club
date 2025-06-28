"use client";
import { useState } from "react";
import { Box, Button, Stack, Heading, Input } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";

export default function AdminLogin() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        const errorMessage = res?.error || "Invalid credentials";
        toaster.create({
          title: "Login Failed",
          type: 'error',
          description: errorMessage,
        });
      } else {
        router.push("/admin");
      }
    } catch {
      const errorMessage = "An error occurred during sign in";
      toaster.create({
        title: "Login Error",
        type: 'error',
        description: errorMessage,
      });
    } finally {
      setIsPending(false);
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
            <Input id="username" name="username" type="text" required />
          </Box>
          <Box>
            <label htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" required />
          </Box>
          <Button type="submit" colorScheme="blue" w="full" loading={isPending}>
            {isPending ? "Signing in..." : "Login"}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
