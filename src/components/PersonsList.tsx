"use client";
import Link from "next/link";
import type { Person } from "@video-club/types";
import GridList from "./GridList";
import { Box, Text } from "@chakra-ui/react";
import Image from "next/image";

interface PersonsListProps {
  initialItems: Person[];
  initialPage: number;
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function PersonsList({
  initialItems,
  initialPage,
  initialPagination,
}: PersonsListProps) {
  const renderPerson = (
    person: Person,
    isImageLoaded: boolean,
    handleImageLoad: (id: string) => void
  ) => {
    return (
      <Link href={`/person/${person._id}/movies`} key={person._id}>
        <article className="person-card">
          <Image
            src={person.profile_url}
            alt={person.name}
            onLoad={() => handleImageLoad(person._id)}
            width={500}
            height={750}
            placeholder="blur"
            blurDataURL="/placeholder.png"
            priority
            style={{
              opacity: isImageLoaded ? 1 : 0,
              transition: "opacity 0.3s",
              willChange: "opacity",
            }}
          />
          <Box className="card-info">
            <Text>{person.name}</Text>
          </Box>
        </article>
      </Link>
    )
  };

  return (
    <GridList<Person>
      fetchUrl={`/api/persons`}
      renderItem={renderPerson}
      loadingSkeletonHeight="300px"
      initialItems={initialItems}
      initialPage={initialPage}
      initialPagination={initialPagination}
    />
  );
}
