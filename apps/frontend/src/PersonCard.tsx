import { Text } from "@chakra-ui/react";
import { Person } from "@video-club/types";

export default function PersonCard({
  person
}: {
  person: Person
}) {
  return (
    <div className="person-card">
      {person.profile_url && (
        <img src={person.profile_url} alt={person.name} />
      )}
      <div className="card-info">
        <Text>{person.name}</Text>
      </div>
    </div>
  );
}
