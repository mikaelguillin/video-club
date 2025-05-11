import { useState, useEffect } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import PersonCard from "./PersonCard";
import { Link } from "react-router";
import type { Person } from "@video-club/types";

export default function PersonsList() {
    const [persons, setPersons] = useState<Person[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/persons`);
          const persons = await response.json();
          setPersons(persons);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, [])
  
    return (
      <SimpleGrid minChildWidth="sm" gap="20px">
        {persons.map((person, index) => (
          <Link to={`/person/${person._id}/movies`} key={index}>
            <PersonCard person={person} />
          </Link>
        ))}
      </SimpleGrid>
    );
  }