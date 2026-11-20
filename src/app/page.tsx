"use client";

import { useCallback, useState } from "react";
import { About } from "@/components/About";
import { CaseStudies } from "@/components/CaseStudies";
import { Contact, Footer } from "@/components/Contact";
import { Disciplines } from "@/components/Disciplines";
import { Experience } from "@/components/Experience";
import { CursorLabel, Marquee, ScrollProgress, Watermark } from "@/components/Extras";
import { OffTheClock } from "@/components/OffTheClock";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Preloader } from "@/components/Preloader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WorkSphere } from "@/components/WorkSphere";

export default function Home() {
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);

  return (
    <SmoothScroll>
      <Preloader onDone={done} />
      <Watermark />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <WorkSphere />
        <CaseStudies />
        <About />
        <OffTheClock />
        <Disciplines />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <CursorLabel />
      <ScrollProgress />
      <div className="grain" aria-hidden />
    </SmoothScroll>
  );
}
