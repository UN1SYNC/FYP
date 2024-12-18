import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Welcome = () => {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="container mx-auto">
        <div className="magicpattern absolute inset-x-0 top-0 -z-10 flex h-full w-full items-center justify-center opacity-100" />
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <motion.div
            className="z-10 flex flex-col items-center gap-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <motion.h1
                className="mb-6 text-pretty text-2xl font-bold lg:text-5xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Welcome to UniSync!
              </motion.h1>
              <motion.div
                className="lg:text-xl font-normal mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Badge variant="default" className="lg:text-xl font-normal">
                  The ultimate solution for streamlined university management
                </Badge>
              </motion.div>
              <motion.div
                className="text-muted-foreground lg:text-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Tailored to your institution's unique needs, <strong>UniSync</strong> lets you{" "}
                <Badge variant="default" className="lg:text-xl font-normal">
                  select
                </Badge>
                ,{" "}
                <Badge variant="default" className="lg:text-xl font-normal">
                  configure
                </Badge>
                , and{" "}
                <Badge variant="default" className="lg:text-xl font-normal">
                  manage
                </Badge>{" "}
                systems. Our platform adapts to your requirements, ensuring flexibility and efficiency, and
                provides you a fully configurable system that suits your university.
              </motion.div>
              <motion.div
                className="mt-4 text-muted-foreground lg:text-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Link
                  href={"/onboarding?step=configure&type=university"}
                  className="lg:text-xl font-normal"
                >
                  <Badge variant="default" className="lg:text-xl font-normal mb-6">
                    Get Started
                  </Badge>
                </Link>{" "}
                today and transform your university’s operations with ease!
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="mt-20 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <p className="text-center text-muted-foreground lg:text-left">
              Built with open-source technologies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { src: "shadcn-ui-small.svg", alt: "ShadCN UI" },
                { src: "typescript-small.svg", alt: "TypeScript" },
                { src: "nextjs-small.svg", alt: "Next.js" },
                { src: "tailwind-small.svg", alt: "Tailwind CSS" },
              ].map((logo, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className={cn(buttonVariants({ variant: "outline" }), "group px-3")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                >
                  <img
                    src={`https://shadcnblocks.com/images/block/logos/${logo.src}`}
                    alt={logo.alt}
                    className="h-6 saturate-0 transition-all group-hover:saturate-100"
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
