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
} from "@chakra-ui/react";

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [personRes, moviesRes] = await Promise.all([
        fetch(`/api/person/${personId}`),
        fetch(`/api/person/${personId}/movies`),
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
    const res = await fetch(`/api/person/${personId}`, {
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
      <Button colorScheme="blue" mb={4}>
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
    </Box>
  );
}
