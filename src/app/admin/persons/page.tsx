"use client";
import { useEffect, useState } from "react";
import { Box, Heading, Button, Spinner, IconButton } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface Person {
  _id: string;
  name: string;
  date: string | number | Date;
  show: boolean;
}

export default function AdminPersons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/persons")
      .then((res) => res.json())
      .then((data) => setPersons(data.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box p={8}>
      <Heading mb={6}>Persons</Heading>
      <Button colorScheme="blue" mb={4}>
        Add Person (from TMDB)
      </Button>
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Interview Date</Table.ColumnHeader>
            <Table.ColumnHeader>Show</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row>
              <Table.Cell colSpan={5} textAlign="center">
                <Spinner />
              </Table.Cell>
            </Table.Row>
          ) : persons.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5} textAlign="center">
                No persons found.
              </Table.Cell>
            </Table.Row>
          ) : (
            persons.map((person) => (
              <Table.Row key={person._id}>
                <Table.Cell>{person._id}</Table.Cell>
                <Table.Cell>{person.name}</Table.Cell>
                <Table.Cell>
                  {person.date
                    ? new Date(person.date).toLocaleDateString()
                    : ""}
                </Table.Cell>
                <Table.Cell>{person.show ? "Yes" : "No"}</Table.Cell>
                <Table.Cell>
                  <IconButton aria-label="Edit" size="sm" mr={2}>
                    ✏️
                  </IconButton>
                  <IconButton
                    aria-label="Delete"
                    size="sm"
                    colorScheme="red"
                    mr={2}
                  >
                    🗑️
                  </IconButton>
                  <IconButton
                    aria-label="Details"
                    size="sm"
                    onClick={() => router.push(`/admin/persons/${person._id}`)}
                  >
                    👁️
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
