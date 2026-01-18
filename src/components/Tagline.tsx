"use client";
import { Link, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";

export function Tagline() {
    const t = useTranslations();
    return (
        <Text fontSize="2xl" color="gray.700" textAlign="center" mt={12} mb={20}>
            {t.rich('Home.tagline', {
                link: (chunks) => (
                <Link
                    color="black"
                    target="_blank"
                    fontWeight="bold"
                    href="https://www.konbini.com/playlist/video-club/"
                >
                    {chunks}
                </Link>
            ),
        })}
      </Text>
    )
}





