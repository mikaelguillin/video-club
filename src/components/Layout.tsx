"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Box, CloseButton, Heading, HStack, Portal, Text, VStack } from "@chakra-ui/react";
import { BsGithub } from "react-icons/bs";
import { Analytics } from "@vercel/analytics/react";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/ui/tooltip";
import {
  IconButton,
  Drawer
} from "@chakra-ui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useDisclosure } from '@chakra-ui/react';
import { PiPopcornDuotone } from "react-icons/pi";

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const {
    open: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
    setOpen: setMenuOpen
  } = useDisclosure();

  function NavLinks({context}: {context: 'desktop' | 'mobile'}) {
    return (
      <>
        <li>
          <Link
            href="/" className={pathname === "/" ? "activeLink" : ""}
            onClick={onMenuClose}
          >
            {t("Menu.celebrities")}
          </Link>
        </li>
        <li>
          <Link
            href="/favorites"
            className={pathname === "/favorites" ? "activeLink" : ""}
            onClick={onMenuClose}
          >
            {t("Menu.myMovieCollection")}
          </Link>
        </li>
        <li>
          {context === 'mobile' ? (
            <>
              <Box asChild color="gray.500">
                <Link href="#">
                  {t("Menu.popularMovies")}
                </Link>
              </Box>
              <Text fontSize="md" textAlign="center" mt={2}>{t("Menu.availableSoon")}</Text>
            </>
          ) : (
            <Tooltip
              content={t("Menu.availableSoon")}
              openDelay={100}
            >
              <Box asChild color="gray.500">
                <Link href="#">
                  {t("Menu.popularMovies")}
                </Link>
              </Box>
            </Tooltip>
          )}
        </li>
      </>
    )
  }

  return (
    <>
      <Box as="header" className="header">
        <div className="container">
          <HStack justifyContent="space-between">
            <Heading as="h1" size="3xl" className="logo">
              <Link href="/">
                <HStack>
                  <PiPopcornDuotone />
                  Video Club
                </HStack>
              </Link>
            </Heading>
            <Box as="nav" ml={10} display={{ base: "none", md: "block" }}>
              <HStack as="ul" fontWeight="bold" gap={7}>
                <NavLinks context="desktop" />
              </HStack>
            </Box>
            <IconButton
              aria-label="Open menu"
              display={{ base: "inline-flex", md: "none" }}
              onClick={onMenuOpen}
              variant="ghost"
              size="lg"
            >
              <GiHamburgerMenu />
            </IconButton>
          </HStack>
        </div>
      </Box>

      <Drawer.Root
        open={isMenuOpen}
        placement="start"
        onOpenChange={(e) => setMenuOpen(e.open)}
        size="full"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="lg" />
              </Drawer.CloseTrigger>
              <Drawer.Header>
                <Drawer.Title />
              </Drawer.Header>
              <Drawer.Body>
                <Box as="nav" mt={10}>
                  <VStack
                    as="ul"
                    flexDirection="column"
                    alignItems="center"
                    gap={12}
                    fontSize="3xl"
                    fontWeight="bold"
                  >
                    <NavLinks context="mobile" />
                  </VStack>
                </Box>
              </Drawer.Body>
              <Drawer.Footer />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <main className="main">{children}</main>

      <footer className="footer">
        <a
          href="https://github.com/mikaelguillin/video-club"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          {t("Footer.seeCodeOnGithub")}
          <BsGithub size={20} style={{ marginLeft: "5px" }} />
        </a>
        <p>{t("Footer.notAnOfficialKonbiniWebsite")}</p>
      </footer>
      <Analytics />
    </>
  );
}
