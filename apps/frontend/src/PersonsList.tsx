import { useState, useEffect } from "react";
import { SimpleGrid, Skeleton } from "@chakra-ui/react";
import PersonCard from "./PersonCard";
import { Link } from "react-router";
import type { Person } from "@video-club/types";

export default function PersonsList() {
    const [persons, setPersons] = useState<Person[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/persons`);
          const personsData = await response.json();
          setPersons(personsData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, [])
  
    return (
      <SimpleGrid
        columns={{
          base: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 5,
        }}
        gap="20px"
      >
        {persons.length ? (
          <>
            {persons.map((person, index) => (
              <Link to={`/person/${person._id}/movies`} key={index}>
                <PersonCard person={person} />
              </Link>
            ))}
          </>
        ) : (
          <>
            {Array.from({ length: 15 }, (_, index) => (
                <Skeleton height="300px" key={index} />
            ))}
          </>
        )}
      </SimpleGrid>
    );
  }