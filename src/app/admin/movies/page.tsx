"use client";
import { useEffect, useState } from "react";
import { Box, Heading, Button, Spinner, IconButton } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";

interface Movie {
  _id: string;
  director: string;
  year: number;
  translations: {
    en: {
      title: string;
      overview: string;
      poster_url: string;
    };
    [key: string]: {
      title?: string;
      overview?: string;
      poster_url?: string;
    };
  };
}

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box p={8}>
      <Heading mb={6}>Movies</Heading>
      <Button colorScheme="blue" mb={4}>
        Add Movie (from TMDB)
      </Button>
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Year</Table.ColumnHeader>
            <Table.ColumnHeader>Director</Table.ColumnHeader>
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
          ) : movies.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5} textAlign="center">
                No movies found.
              </Table.Cell>
            </Table.Row>
          ) : (
            movies.map((movie) => (
              <Table.Row key={movie._id}>
                <Table.Cell>{movie._id}</Table.Cell>
                <Table.Cell>{movie.translations?.en.title || ""}</Table.Cell>
                <Table.Cell>{movie.year}</Table.Cell>
                <Table.Cell>{movie.director}</Table.Cell>
                <Table.Cell>
                  <IconButton aria-label="Edit" size="sm" mr={2}>
                    ✏️
                  </IconButton>
                  <IconButton aria-label="Delete" size="sm" colorScheme="red">
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
