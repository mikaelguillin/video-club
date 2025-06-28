"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Heading,
  Button,
  Input,
  Stack,
  Table,
  Spinner,
  IconButton,
  Text,
  useDisclosure,
  Dialog,
  Portal,
  CloseButton,
  Combobox,
  useListCollection,
} from "@chakra-ui/react";
import { useAsync, useDebounce } from "react-use";
import { toaster } from "@/components/ui/toaster";

interface Person {
  _id: string;
  name: string;
  date: string | number | Date;
  show: boolean;
  video: string;
  profile_url: string;
}

interface Movie {
  _id: string;
  translations: {
    en: {
      title: string;
    };
    [key: string]: {
      title?: string;
    };
  };
  year: number;
  director: string;
}

type DatabaseMovie = {
  _id: string;
  translations: { en: { title: string }; fr?: { title: string } };
  year: number;
  director: string;
};

export default function AdminPersonDetails() {
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    date: "",
    show: false,
    video: "",
    profile_url: "",
  });
  const { open, onOpen, onClose } = useDisclosure();
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");
  useDebounce(() => setDebouncedInputValue(inputValue), 300, [inputValue]);

  const { collection, set } = useListCollection<DatabaseMovie>({
    initialItems: [],
    itemToString: (item) => `${item.translations.en.title} (${item.year})`,
    itemToValue: (item) => item._id,
  });

  const [selectedMovie, setSelectedMovie] = useState<DatabaseMovie>();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [personRes, moviesRes] = await Promise.all([
        fetch(`/admin/api/person/${personId}`),
        fetch(`/admin/api/person/${personId}/movies`),
      ]);
      const personData = await personRes.json();
      const moviesData = await moviesRes.json();
      setPerson(personData);
      setForm({
        name: personData.name || "",
        date: personData.date
          ? new Date(personData.date).toISOString().slice(0, 10)
          : "",
        show: !!personData.show,
        video: personData.video || "",
        profile_url: personData.profile_url || "",
      });
      setMovies(moviesData.items);
      setLoading(false);
    }
    fetchData();
  }, [personId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    const res = await fetch(`/admin/api/person/${personId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    if (res.ok) {
      toaster.create({
        type: "success",
        title: "Success",
        description: "Person updated",
      });
    } else {
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to update person",
      });
    }
  };

  const movieSearchState = useAsync(async () => {
    if (!debouncedInputValue) {
      set([]);
      return;
    }
    const res = await fetch(
      `/admin/api/movies/search?search=${encodeURIComponent(
        debouncedInputValue
      )}&personId=${personId}`
    );
    const data = await res.json();
    set(data.items);
  }, [debouncedInputValue, set, personId]);

  const handleAddMovie = async () => {
    if (!selectedMovie) {
      toaster.create({
        type: "error",
        title: "Error",
        description: "Please select a movie",
      });
      return;
    }

    const res = await fetch(`/admin/api/person/${personId}/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: selectedMovie._id }),
    });

    if (res.ok) {
      onClose();
      setSelectedMovie(undefined);
      setInputValue("");
      set([]);
      // Refresh the movies list
      const moviesRes = await fetch(`/admin/api/person/${personId}/movies`);
      const moviesData = await moviesRes.json();
      setMovies(moviesData.items);
      toaster.create({
        type: "success",
        title: "Success",
        description: "Movie added to person",
      });
    } else {
      const errorData = await res.json();
      toaster.create({
        type: "error",
        title: "Error",
        description: errorData.error || "Failed to add movie",
      });
    }
  };

  const handleRemoveMovie = async (movieId: string) => {
    const res = await fetch(`/admin/api/person/${personId}/movies`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });

    if (res.ok) {
      // Refresh the movies list
      const moviesRes = await fetch(`/admin/api/person/${personId}/movies`);
      const moviesData = await moviesRes.json();
      setMovies(moviesData.items);
      toaster.create({
        type: "success",
        title: "Success",
        description: "Movie removed from person",
      });
    } else {
      const errorData = await res.json();
      toaster.create({
        type: "error",
        title: "Error",
        description: errorData.error || "Failed to remove movie",
      });
    }
  };

  if (loading) {
    return (
      <Box p={8}>
        <Spinner />
      </Box>
    );
  }
  if (!person) {
    return (
      <Box p={8}>
        <Text>Person not found.</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Person Details</Heading>
      <Stack gap={4} mb={8} maxW="md">
        <Box>
          <Text fontWeight="bold">Name</Text>
          <Input name="name" value={form.name} onChange={handleChange} />
        </Box>
        <Box>
          <Text fontWeight="bold">Interview Date</Text>
          <Input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
        </Box>
        <Box>
          <Text fontWeight="bold">Show</Text>
          <input
            name="show"
            type="checkbox"
            checked={form.show}
            onChange={handleChange}
          />
        </Box>
        <Box>
          <Text fontWeight="bold">YouTube Video ID</Text>
          <Input name="video" value={form.video} onChange={handleChange} />
        </Box>
        <Box>
          <Text fontWeight="bold">Profile URL</Text>
          <Input
            name="profile_url"
            value={form.profile_url}
            onChange={handleChange}
          />
        </Box>
        <Button colorScheme="green" onClick={handleSave}>
          Save
        </Button>
      </Stack>
      <Heading size="md" mb={4}>
        Movies
      </Heading>
      <Button colorScheme="blue" mb={4} onClick={onOpen}>
        Add Movie (from Database)
      </Button>
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Year</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {movies.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4} textAlign="center">
                No movies found.
              </Table.Cell>
            </Table.Row>
          ) : (
            movies.map((movie) => (
              <Table.Row key={movie._id}>
                <Table.Cell>{movie._id}</Table.Cell>
                <Table.Cell>{movie.translations.en.title}</Table.Cell>
                <Table.Cell>{movie.year}</Table.Cell>
                <Table.Cell>
                  <IconButton
                    aria-label="Remove"
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleRemoveMovie(movie._id)}
                  >
                    🗑️
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
      <Dialog.Root
        size="cover"
        placement="center"
        motionPreset="slide-in-bottom"
        open={open}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Search Movie from Database</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={onClose} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  {selectedMovie && (
                    <Text>
                      Selected movie: {selectedMovie.translations.en.title} (
                      {selectedMovie.year})
                    </Text>
                  )}
                  <Combobox.Root
                    collection={collection}
                    onInputValueChange={({ inputValue }) =>
                      setInputValue(inputValue)
                    }
                    onValueChange={(selected) => {
                      setSelectedMovie(selected.items[0]);
                    }}
                  >
                    <Combobox.Control>
                      <Combobox.Input placeholder="Search for a movie title or director..." />
                      <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                      </Combobox.IndicatorGroup>
                    </Combobox.Control>
                    <Combobox.Positioner>
                      <Combobox.Content>
                        {movieSearchState.loading ? (
                          <Box p={2} textAlign="center">
                            <Spinner size="sm" />
                          </Box>
                        ) : movieSearchState.error ? (
                          <Box p={2} textAlign="center">
                            Error searching movies
                          </Box>
                        ) : (
                          collection.items.map((item) => (
                            <Combobox.Item item={item} key={item._id}>
                              <Text>
                                {item.translations.en.title} ({item.year})
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {item.director}
                              </Text>
                              <Combobox.ItemIndicator />
                            </Combobox.Item>
                          ))
                        )}
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Combobox.Root>
                  <Button
                    colorScheme="blue"
                    onClick={handleAddMovie}
                    disabled={!selectedMovie}
                  >
                    Add Movie
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
