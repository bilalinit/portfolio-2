import Cursor from "@/components/Cursor";
import IntroSplash from "@/components/IntroSplash";
import Hero from "@/components/Hero";
import Showcase from "@/components/Showcase";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <>
      <Cursor />
      <IntroSplash />
      <Hero />
      <Showcase />
      <Pricing />
      <Footer />
      <ChatWidget />
    </>
  );
}
