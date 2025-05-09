export default function PersonCard({
  person
}: {
  person: any
}) {
  return (
    <div>
      {person.profile_url && (
        <img src={person.profile_url} alt={person.name} />
      )}
      <div>
        <h2>{person.name}</h2>
      </div>
    </div>
  );
}
