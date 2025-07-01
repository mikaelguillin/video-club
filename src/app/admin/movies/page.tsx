"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  Spinner,
  IconButton,
  Image,
  Input,
  Field,
  Dialog,
  Portal,
  CloseButton,
  Stack,
  Text,
  Combobox,
  Table,
  Pagination,
  ButtonGroup
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useAsync, useDebounce } from "react-use";
import { useListCollection } from "@chakra-ui/react";
import { BsPencil, BsTrash } from "react-icons/bs";
import type { Movie } from "@/types";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

type MovieForm = Omit<Movie, '_id' | 'backdrop_url'>

const defaultMovieForm: MovieForm = {
  director: "",
  year: "",
  translations: {
    en: { title: "", overview: "", poster_url: "" },
  },
};

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  poster_path?: string;
  original_language?: string;
  director?: string;
};

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<MovieForm>(defaultMovieForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [inputValueEn, setInputValueEn] = useState("");
  const [debouncedInputValueEn, setDebouncedInputValueEn] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedInputValueEn(inputValueEn), 300, [
    inputValueEn,
  ]);
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const { collection: collectionEn, set: setEn } = useListCollection<TmdbMovie>(
    {
      initialItems: [],
      itemToString: (item) => item.title,
      itemToValue: (item) => `${item.id}`,
    }
  );

  const fetchMovie = async (language: string, year?: string) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    let url = `https://api.themoviedb.org/3/search/movie?&query=${encodeURIComponent(
        debouncedInputValueEn
      )}&language=${language}`;

    if(year) url += `&year=${year}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    return res.json();
  }

  const tmdbSearchStateEn = useAsync(async () => {
    if (!debouncedInputValueEn) {
      setEn([]);
      return;
    }
    const data = await fetchMovie('en-US');
    setEn(data.results);
  }, [debouncedInputValueEn, setEn]);

  useEffect(() => {
    fetchMovies(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchMovies(1);
  }, [debouncedSearchTerm]);

  const fetchMovies = (page: number = 1) => {
    setLoading(true);
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: itemsPerPage.toString(),
    });
    if (debouncedSearchTerm.trim()) {
      searchParams.append("search", debouncedSearchTerm.trim());
    }
    fetch(`/admin/api/movies?${searchParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.items);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      })
      .finally(() => setLoading(false));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchMovies(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    lang = "en"
  ) => {
    const { name, value } = e.target;
    if (["title", "overview", "poster_url"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            title:
              name === "title" ? value : prev.translations[lang]?.title ?? "",
            overview:
              name === "overview"
                ? value
                : prev.translations[lang]?.overview ?? "",
            poster_url:
              name === "poster_url"
                ? value
                : prev.translations[lang]?.poster_url ?? "",
          },
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddMovie = async () => {
    if (!form.director || !form.year || !form.translations.en.title) {
      toaster.create({
        title: "Error",
        type: "error",
        description: "Director, year, and English title are required",
      });
      return;
    }
    const res = await fetch("/admin/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setAddOpen(false);
      setForm(defaultMovieForm);
      fetchMovies(currentPage);
      toaster.create({
        title: "Success",
        type: "success",
        description: "Movie added",
      });
    } else {
      toaster.create({
        title: "Error",
        type: "error",
        description: "Failed to add movie",
      });
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setEditId(movie._id);
    const translations: Record<
      string,
      { title: string; overview: string; poster_url: string }
    > = {};
    Object.entries(movie.translations).forEach(([lang, t]) => {
      translations[lang] = {
        title: t.title ?? "",
        overview: t.overview ?? "",
        poster_url: t.poster_url ?? "",
      };
    });
    setForm({
      director: movie.director,
      year: movie.year,
      translations,
    });
    setEditOpen(true);
  };

  const handleUpdateMovie = async () => {
    if (!editId) return;
    const res = await fetch(`/admin/api/movie/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditOpen(false);
      setEditId(null);
      setForm(defaultMovieForm);
      fetchMovies(currentPage);
      toaster.create({
        title: "Success",
        type: "success",
        description: "Movie updated",
      });
    } else {
      toaster.create({
        title: "Error",
        type: "error",
        description: "Failed to update movie",
      });
    }
  };

  const handleDeleteMovie = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    const res = await fetch(`/admin/api/movie/${deleteId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchMovies(currentPage);
      toaster.create({
        title: "Success",
        type: "success",
        description: "Movie deleted",
      });
    } else {
      toaster.create({
        title: "Error",
        type: "error",
        description: "Failed to delete movie",
      });
    }
    setDeleteId(null);
    setDeleteLoading(false);
  };

  return (
    <>
      <Heading mb={6}>Movies</Heading>
      <Button colorPalette="blue" mb={4} onClick={() => setAddOpen(true)}>
        Add Movie
      </Button>
      <Box mb={4} display="flex" gap={2} alignItems="center">
        <Input
          placeholder="Search movies by title or director..."
          value={searchTerm}
          onChange={handleSearchChange}
          maxW="400px"
        />
        {searchTerm && (
          <Button size="sm" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </Box>
      <Text mb={4} color="gray.600">
        {debouncedSearchTerm
          ? `Found ${totalItems} movies matching "${debouncedSearchTerm}"`
          : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(
              currentPage * itemsPerPage,
              totalItems
            )} of ${totalItems} movies`}
      </Text>
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
                  <IconButton
                    colorPalette="blue"
                    aria-label="Edit"
                    size="sm"
                    mr={2}
                    onClick={() => handleEditMovie(movie)}
                  >
                    <BsPencil />
                  </IconButton>
                  <IconButton
                    aria-label="Delete"
                    size="sm"
                    colorPalette="red"
                    onClick={() => setDeleteId(movie._id)}
                  >
                    <BsTrash />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
      <Pagination.Root count={totalItems} pageSize={itemsPerPage} page={currentPage} mt={5} textAlign="center">
        <ButtonGroup variant="ghost" size="sm" wrap="wrap">
          <Pagination.PrevTrigger asChild>
            <IconButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton
                variant={{ base: "ghost", _selected: "outline" }}
                onClick={() => handlePageChange(page.value)}
              >
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>

      {/* Add Movie Modal */}
      <Dialog.Root
        open={addOpen}
        onOpenChange={(details) => setAddOpen(!!details.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Add Movie</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={() => setAddOpen(false)} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Combobox.Root
                    collection={collectionEn}
                    onInputValueChange={({ inputValue }) =>
                      setInputValueEn(inputValue)
                    }
                    onValueChange={async({ items }) => {
                      const item = items[0];
                      if (item) {
                        const data = await Promise.all([fetchMovie('fr-FR', item.release_date?.slice(0, 4))]);
                        const frenchVersion = data[0].results[0];
                        setForm((prev) => ({
                          ...prev,
                          year: item.release_date
                            ? item.release_date.slice(0, 4)
                            : prev.year,
                          translations: {
                            ...prev.translations,
                            en: {
                              title: item.title || "",
                              overview: item.overview || "",
                              poster_url: item.poster_path
                                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                : "",
                            },
                            fr: {
                              title: frenchVersion.title,
                              overview: frenchVersion.overview,
                              poster_url: frenchVersion.poster_path
                                ? `https://image.tmdb.org/t/p/w500${frenchVersion.poster_path}`
                                : "",
                            }
                          },
                        }));
                      }
                    }}
                  >
                    <Combobox.Control>
                      <Combobox.Input placeholder="Search movie from TMDB..." />
                      <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                      </Combobox.IndicatorGroup>
                    </Combobox.Control>
                    <Combobox.Positioner>
                      <Combobox.Content>
                        {tmdbSearchStateEn.loading ? (
                          <Box p={2} textAlign="center">
                            <Spinner size="sm" />
                          </Box>
                        ) : tmdbSearchStateEn.error ? (
                          <Box p={2} textAlign="center">
                            Error fetching movies
                          </Box>
                        ) : (
                          collectionEn.items.map((item) => (
                            <Combobox.Item item={item} key={item.id} justifyContent="initial">
                              <Image
                                src={
                                  item.poster_path
                                    ? `https://image.tmdb.org/t/p/w45${item.poster_path}`
                                    : "/placeholder.png"
                                }
                                alt=""
                                height={67}
                                width={45}
                                style={{ objectFit: "cover", marginRight: 8 }}
                              />
                              <span>
                                {item.title} {item.release_date ? `(${item.release_date.slice(0, 4)})` : ''}
                              </span>
                              <Combobox.ItemIndicator />
                            </Combobox.Item>
                          ))
                        )}
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Combobox.Root>
                  <Field.Root>
                    <Field.Label>Title</Field.Label>
                    <Input
                      name="title"
                      placeholder="Title"
                      value={form.translations.en.title}
                      onChange={(e) => handleFormChange(e, "en")}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Director</Field.Label>
                    <Input
                      name="director"
                      placeholder="Director"
                      value={form.director}
                      onChange={handleFormChange}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Year</Field.Label>
                    <Input
                      name="year"
                      type="number"
                      placeholder="Year"
                      value={form.year}
                      onChange={handleFormChange}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Overview</Field.Label>
                    <Input
                      name="overview"
                      placeholder="Overview"
                      value={form.translations.en.overview}
                      onChange={(e) => handleFormChange(e, "en")}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Poster URL</Field.Label>
                    <Input
                      name="poster_url"
                      placeholder="Poster URL"
                      value={form.translations.en.poster_url}
                      onChange={(e) => handleFormChange(e, "en")}
                    />
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button colorPalette="blue" mr={3} onClick={handleAddMovie}>
                  Add
                </Button>
                <Button variant="surface" onClick={() => setAddOpen(false)}>Cancel</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Edit Movie Modal */}
      <Dialog.Root
        open={editOpen}
        onOpenChange={(details) => setEditOpen(!!details.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Edit Movie</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={() => setEditOpen(false)} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>
                      Title
                    </Field.Label>
                    <Input
                      name="title"
                      placeholder="Title"
                      value={form.translations.en.title}
                      onChange={(e) => handleFormChange(e, "en")}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>
                      Director
                    </Field.Label>
                    <Input
                      name="director"
                      placeholder="Director"
                      value={form.director}
                      onChange={handleFormChange}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>
                      Year
                    </Field.Label>
                    <Input
                      name="year"
                      type="number"
                      placeholder="Year"
                      value={form.year}
                      onChange={handleFormChange}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>
                      Overview
                    </Field.Label>
                    <Input
                      name="overview"
                      placeholder="Overview"
                      value={form.translations.en.overview}
                      onChange={(e) => handleFormChange(e, "en")}
                      />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>
                      Poster URL
                    </Field.Label>
                    <Input
                      name="poster_url"
                      placeholder="Poster URL"
                      value={form.translations.en.poster_url}
                      onChange={(e) => handleFormChange(e, "en")}
                    />
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button colorPalette="blue" mr={3} onClick={handleUpdateMovie}>
                  Save
                </Button>
                <Button variant="surface" onClick={() => setEditOpen(false)}>Cancel</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete Movie Modal */}
      <Dialog.Root
        open={!!deleteId}
        onOpenChange={(details) => {
          if (!details.open) setDeleteId(null);
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Movie</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={() => setDeleteId(null)} />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Text mb={4}>
                  Are you sure you want to delete this movie? This action cannot
                  be undone.
                </Text>
                <Stack direction="row" justify="flex-end" gap={2}>
                  <Button variant="surface" onClick={() => setDeleteId(null)}>Cancel</Button>
                  <Button
                    colorPalette="red"
                    onClick={handleDeleteMovie}
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
    </>
  );
}
