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
}

type TmdbMovie = { id: number; title: string; release_date?: string };

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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { open, onOpen, onClose } = useDisclosure();
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");
  useDebounce(() => setDebouncedInputValue(inputValue), 300, [inputValue]);

  const { collection, set } = useListCollection<TmdbMovie>({
    initialItems: [],
    itemToString: (item) =>
      `${item.title} (${item.release_date?.slice(0, 4) || ""})`,
    itemToValue: (item) => `${item.id}`,
  });

  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie>();

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
      setMessage({ type: "success", text: "Person updated" });
    } else {
      setMessage({ type: "error", text: "Failed to update person" });
    }
  };

  const tmdbSearchState = useAsync(async () => {
    if (!debouncedInputValue) {
      set([]);
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?&query=${encodeURIComponent(
        debouncedInputValue
      )}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const data = await res.json();
    set(data.results);
  }, [debouncedInputValue, set]);

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
        {message && (
          <Text
            color={message.type === "success" ? "green.500" : "red.500"}
            mt={2}
          >
            {message.text}
          </Text>
        )}
      </Stack>
      <Heading size="md" mb={4}>
        Movies
      </Heading>
      <Button colorScheme="blue" mb={4} onClick={onOpen}>
        Add Movie (from TMDB)
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
                  <IconButton aria-label="Remove" size="sm" colorScheme="red">
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
                <Dialog.Title>Search Movie from TMDB</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={onClose} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <p>Selected movie: {selectedMovie?.title}</p>
                  <Combobox.Root
                    collection={collection}
                    onInputValueChange={(e) => setInputValue(e.inputValue)}
                    onValueChange={(selected) => {
                      setSelectedMovie(selected.items[0]);
                    }}
                  >
                    <Combobox.Control>
                      <Combobox.Input placeholder="Search for a movie title..." />
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
                        ) : (
                          collection.items.map((item) => (
                            <Combobox.Item item={item} key={item.id}>
                              {item.title}{" "}
                              {item.release_date
                                ? `(${item.release_date.slice(0, 4)})`
                                : ""}
                              <Combobox.ItemIndicator />
                            </Combobox.Item>
                          ))
                        )}
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Combobox.Root>
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
