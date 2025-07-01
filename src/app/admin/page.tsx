"use client";
import { Stack, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { BsFilm, BsPersonFill } from "react-icons/bs";

export default function AdminDashboard() {
  return (
    <Stack direction="row" gap={4} alignItems="center">
      <ChakraLink
        as={Link}
        href="/admin/movies"
        border="1px solid"
        p={10}
        borderRadius="md"
        fontSize="2xl"
      >
        <BsFilm /> Movies
      </ChakraLink>
      <ChakraLink
        as={Link}
        href="/admin/persons"
        border="1px solid"
        p={10}
        borderRadius="md"
        fontSize="2xl"
      >
        <BsPersonFill /> Persons
      </ChakraLink>
    </Stack>
  );
}
