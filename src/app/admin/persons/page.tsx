"use client";
import { useEffect, useState } from "react";
import { Box, Heading, Button, Spinner, IconButton, Span, Image, useDisclosure } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  Portal,
  CloseButton,
  Stack,
  Combobox,
  Input,
  useListCollection,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useAsync, useDebounce } from "react-use";
import { toaster } from "@/components/ui/toaster";

interface Person {
  _id: string;
  tmdbId: number;
  name: string;
  profileImage: string;
  date: string;
  show: boolean;
}

type TMDBPerson = { id: number; name: string; profile_path?: string };

export default function AdminPersons() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({
    name: "",
    profile_url: "",
    date: "",
    show: true
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const { open, onOpen, onClose } = useDisclosure();
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");
  useDebounce(() => setDebouncedInputValue(inputValue), 300, [inputValue]);

  const { collection, set } = useListCollection<TMDBPerson>({
    initialItems: [],
    itemToString: (item) => item.name,
    itemToValue: (item) => `${item.id}`,
  });

  useEffect(() => {
    fetch("/admin/api/persons")
      .then((res) => res.json())
      .then((data) => setPersons(data.items))
      .finally(() => setLoading(false));
  }, []);

  const tmdbSearchState = useAsync(async () => {
    if (!debouncedInputValue) {
      set([]);
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const res = await fetch(
      `https://api.themoviedb.org/3/search/person?&query=${encodeURIComponent(
        debouncedInputValue
      )}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const data = await res.json();
    set(data.results);
  }, [debouncedInputValue, set]);

  const handleAddPerson = async () => {
    if (
      !addForm.name ||
      !addForm.profile_url ||
      !addForm.date
    ) {
        toaster.create({
            title: 'Error',
            type: 'error',
            description: 'All fields are required'
        });
      return;
    }
    const res = await fetch("/admin/api/persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name,
        profile_url: addForm.profile_url,
        date: addForm.date,
        show: addForm.show
      }),
    });
    if (res.ok) {
      onClose();
      setAddForm({ name: "", profile_url: "", date: "", show: true });
      setInputValue("");
      set([]);
      setLoading(true);
      fetch("/admin/api/persons")
        .then((res) => res.json())
        .then((data) => setPersons(data.items))
        .finally(() => setLoading(false));
      toaster.create({
        title: 'Success',
        type: 'success',
        description: 'Person added'
    });
    } else {
      toaster.create({
        title: 'Error',
        type: 'error',
        description: 'Failed to add person'
    });
    }
  };

  const handleDeletePerson = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    const res = await fetch(`/admin/api/person/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setPersons((prev) => prev.filter((p) => p._id !== deleteId));
      toaster.create({
        title: 'Success',
        type: 'success',
        description: 'Person deleted'
    });
    } else {
      toaster.create({
        title: 'Error',
        type: 'error',
        description: 'Failed to delete person'
    });
    }
    setDeleteId(null);
    setDeleteLoading(false);
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Persons</Heading>
      <Button colorScheme="blue" mb={4} onClick={onOpen}>
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
                  <IconButton
                    aria-label="Edit"
                    size="sm"
                    mr={2}
                    onClick={() => router.push(`/admin/persons/${person._id}`)}
                  >
                    ✏️
                  </IconButton>
                  <IconButton
                    aria-label="Delete"
                    size="sm"
                    colorScheme="red"
                    mr={2}
                    onClick={() => setDeleteId(person._id)}
                  >
                    🗑️
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={open}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Add Person from TMDB</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton
                    size="sm"
                    onClick={onClose}
                  />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Combobox.Root
                    collection={collection}
                    onInputValueChange={({ inputValue }) =>
                        setInputValue(inputValue)
                    }
                    onValueChange={({ items }) => {
                      const item = items[0];
                      if (item) {
                        setAddForm({
                          ...addForm,
                          name: item.name,
                          profile_url: item.profile_path
                            ? `https://image.tmdb.org/t/p/w500${item.profile_path}`
                            : "",
                        });
                      }
                    }}
                  >
                    <Combobox.Control>
                      <Combobox.Input placeholder="Select a person..." />
                      <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                      </Combobox.IndicatorGroup>
                    </Combobox.Control>
                    <Combobox.Positioner>
                      <Combobox.Content>
                        {tmdbSearchState.loading ? (
                          <Box p={2} textAlign="center">
                            <Spinner size="sm" />
                          </Box>
                        ) : tmdbSearchState.error ? (
                          <Box p={2} textAlign="center">
                            Error fetching movies
                          </Box>
                        ) : collection.items.map((item) => (
                          <Combobox.Item item={item} key={item.id}>
                            <Image
                                src={item.profile_path ? `https://image.tmdb.org/t/p/w45${item.profile_path}` : '/placeholder.png'}
                                alt=""
                                height={67}
                                width={45}
                            />
                            <Span>{item.name}</Span>
                            <Combobox.ItemIndicator />
                          </Combobox.Item>
                        ))}
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Combobox.Root>
                  <Input
                    type="date"
                    placeholder="Interview Date"
                    value={addForm.date}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, date: e.target.value }))
                    }
                    required
                  />
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button colorScheme="blue" mr={3} onClick={handleAddPerson}>
                  Add
                </Button>
                <Button onClick={() => {
                    onClose();
                    setAddForm({ name: "", profile_url: "", date: "", show: true })
                }}>
                    Cancel
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Person</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={() => setDeleteId(null)} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Text mb={4}>
                  Are you sure you want to delete this person? This action
                  cannot be undone.
                </Text>
                <Stack direction="row" justify="flex-end" gap={2}>
                  <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDeletePerson}
                    loading={deleteLoading}
                  >
                    Delete
                  </Button>
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
