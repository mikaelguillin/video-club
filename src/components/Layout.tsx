import Link from "next/link";
import { Heading } from "@chakra-ui/react";
import { BsGithub } from "react-icons/bs";
import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="header">
        <Heading as="h1" size="3xl" className="logo">
          <Link href="/">Video Club</Link>
        </Heading>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <a href="https://github.com/mikaelguillin/video-club" style={{display: 'inline-flex', alignItems: 'center'}}>
          See the code on GitHub
          <BsGithub size={20} style={{marginLeft: '5px'}} />
        </a>
        <p>This is not an official website of Konbini.</p>
      </footer>
      <Analytics />
    </>
  );
}
