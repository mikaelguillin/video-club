"use client";

import {
  AspectRatio,
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  Image,
  Portal,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import type { Person } from "@video-club/types";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function PersonMoviesHeader({ person }: { person?: Person }) {
  const t = useTranslations();
  const router = useRouter();
  return (
    <>
      {person ? (
        <Box
          className="person-movies-header"
          display={{ md: "flex" }}
          textAlign={{ mdDown: "center" }}
        >
          <Box
            className="person-name"
            display={{ md: "flex" }}
            mb={{ mdDown: 4 }}
            alignItems="center"
          >
            <Image
              hideBelow="md"
              src={person.profile_url}
              borderRadius="full"
              border="1px solid #ddd"
              boxSize="80px"
              alt={person.name}
              mr={3}
            />
            <Heading size="3xl">
              {t('MoviesList.personSelection', { name: person.name })}
            </Heading>
          </Box>
          {person.video && (
            <Dialog.Root size="xl" placement="top" motionPreset="slide-in-bottom">
              <Dialog.Trigger asChild>
                <Button variant="outline" size="sm" ml="auto">
                  🎬 {t('MoviesList.watchInterview')}
                </Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop backgroundColor="blackAlpha.800" />
                <Dialog.Positioner>
                  <Dialog.Content backgroundColor="transparent" boxShadow="none">
                    <Dialog.Header>
                      <Dialog.CloseTrigger asChild color="white">
                        <CloseButton size="sm" variant="plain" />
                      </Dialog.CloseTrigger>
                    </Dialog.Header>
                    <Dialog.Body>
                      <AspectRatio maxW="100%" ratio={16 / 9}>
                        <iframe
                          src={`https://www.youtube.com/embed/${person.video}?autoplay=1`}
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        ></iframe>
                      {/* </Box> */}
                      </AspectRatio>
                    </Dialog.Body>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          )}
        </Box>
      ) : (
        <Flex mt="3" mb="3" alignItems="center">
          <SkeletonCircle size="80px" />
          <SkeletonText ml="3" noOfLines={1} width="300px" />
        </Flex>
      )}
      <Button mb={3} variant="plain" onClick={() => router.back()}>
        ‹ {t('Actions.back')}
      </Button>
    </>
  );
}
