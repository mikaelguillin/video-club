"use client";
import { Box, Heading, Stack, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminDashboard() {
  return (
    <Box p={8}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
      >
        <Heading>Admin Dashboard</Heading>
        <LogoutButton />
      </Stack>
      <Stack direction="column" gap={4} alignItems="flex-start">
        <ChakraLink as={Link} href="/admin/movies">
          Movies
        </ChakraLink>
        <ChakraLink as={Link} href="/admin/persons">
          Persons
        </ChakraLink>
      </Stack>
    </Box>
  );
}
