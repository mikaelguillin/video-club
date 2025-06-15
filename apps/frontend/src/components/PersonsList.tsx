import { Link } from "react-router";
import type { Person } from "@video-club/types";
import GridList from "./GridList";
import { Box, Image, Skeleton, Text } from "@chakra-ui/react";

export default function PersonsList() {
  const renderPerson = (
    person: Person,
    index: number,
    isImageLoaded: boolean,
    handleImageLoad: (id: string) => void
  ) => {
    return (
        <Skeleton
          key={index}
          height={!isImageLoaded ? "350px" : "auto"}
          loading={!isImageLoaded}
        >
          <Link to={`/person/${person._id}/movies`}>
            <div
              className="person-card"
              style={{
                opacity: isImageLoaded ? 1 : 0,
                transform: `translateY(${isImageLoaded ? "0" : "10px"})`,
                transition:
                  "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                position: "relative",
                zIndex: isImageLoaded ? 1 : 0,
              }}
            >
              <Image
                src={person.profile_url}
                alt={person.name}
                onLoad={() => handleImageLoad(person._id)}
              />
              <Box className="card-info">
                <Text>{person.name}</Text>
              </Box>
            </div>
          </Link>
        </Skeleton>
    );
  };

  return (
    <GridList<Person>
      fetchUrl={`${import.meta.env.VITE_API_URL}/persons`}
      renderItem={renderPerson}
      loadingSkeletonCount={15}
      loadingSkeletonHeight="300px"
    />
  );
}
