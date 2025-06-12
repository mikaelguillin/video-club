import { Box, Button, Heading, Image, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import type { Person } from "@video-club/types";

export default function PersonMoviesHeader({
    person
}: {
    person?: Person
}) {
    return (
        <>
            {person ? (
                <Box
                    className="person-movies-header"
                    display={{
                        base: "block",
                        sm: "flex",
                    }}
                >
                <div className="person-name">
                    <Image
                        hideBelow="md"
                        src={person.profile_url}
                        borderRadius="full"
                        border="1px solid #ddd"
                        boxSize="80px"
                        alt={person.name}
                        margin={"0 .75em 0 0"}
                    />
                    <Heading size="3xl">
                        {person.name}'
                        {person.name.charAt(person.name.length - 1) === "s" ? "" : "s"}{" "}
                        selection
                    </Heading>
                </div>
                <Button variant="outline" ml="auto" mt={{ base: 2, sm: 0 }} asChild>
                    <a
                    href={`https://www.youtube.com/watch?v=${person.video}`}
                    target="_blank"
                    >
                    🎬 Watch the interview
                    </a>
                </Button>
                </Box>
            ) : (
                <div style={{ margin: "1em 0", display: "flex", alignItems: "center" }}>
                    <SkeletonCircle size="80px" />
                    <SkeletonText ml="2" noOfLines={1} width="300px" />
                </div>
            )}
        </>
    )
}