import { Box, Button, Flex, Heading, Image, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import type { Person } from "@video-club/types";
import { useNavigate } from "react-router";

export default function PersonMoviesHeader({
    person
}: {
    person?: Person
}) {
    const navigate = useNavigate();
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
                <Flex mt="3" mb="3" alignItems="center">
                    <SkeletonCircle size="80px" />
                    <SkeletonText ml="3" noOfLines={1} width="300px" />
                </Flex>
            )}
            <Button
                mb={3}
                variant="plain"
                onClick={() => navigate(-1)}
            >
                ‹ Back
            </Button>
        </>
    )
}