"use client";
import {
  Box,
  Heading,
  Stack,
  Link as ChakraLink,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/admin/api/logout", { method: "POST" });
    router.push("/admin/login");
  };
  return (
    <Box p={8}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
      >
        <Heading>Admin Dashboard</Heading>
        <Button colorScheme="red" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>
      <Stack direction="column" gap={4} alignItems="flex-start">
        <ChakraLink as={Link} href="/admin/movies">
          Movies
        </ChakraLink>
        <ChakraLink as={Link} href="/admin/persons">
          Persons
        </ChakraLink>
        <ChakraLink as={Link} href="/admin/associations">
          Associations
        </ChakraLink>
      </Stack>
    </Box>
  );
}
