"use client";
import { Link, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";

export function Tagline() {
    const t = useTranslations();
    return (
        <Text textAlign="center" mb={8}>
            {t.rich('Home.tagline', {
                link: (chunks) => (
                <Link
                    target="_blank"
                    color="blue.600"
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





