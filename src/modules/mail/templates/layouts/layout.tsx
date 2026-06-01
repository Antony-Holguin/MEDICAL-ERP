import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Img,
  Tailwind,
  Section,
  Link,
} from '@react-email/components';
import { Brand } from '@modules/mail/types';

const EmailLayout = ({
  brand,
  children,
}: {
  brand: Brand;
  children: React.ReactNode;
}) => {
  return (
    <Html>
      <Link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      ></Link>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: '#f99b1f',
                'background-light': '#f8f7f5',
                'background-dark': '#231a0f',
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
          <Container className="flex-grow flex items-center justify-center p-6 md:p-12 w-full max-w-2xl">
            <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <div className="h-1.5 bg-primary w-full"></div>
              <div className="p-8 md:p-12 flex flex-col items-center">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-2">
                    <Img
                      src={brand.imageUrl}
                      alt={`${brand.name} logo`}
                      className="w-6 h-6"
                    />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-primary dark:text-white uppercase">
                    {brand.name}
                  </span>
                </div>
                {/* <!-- Email Content Section --> */}
                <div className="text-center space-y-6 max-w-md mx-auto">
                  {children}
                </div>
                {/* <!-- Email Footer Divider --> */}
                <div className="w-full border-t border-zinc-100 dark:border-zinc-800 mt-12 mb-8"></div>
                {/* <!-- Email Footer Content --> */}
                <div className="text-center space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    Si tienes alguna duda, contáctanos en{' '}
                    <a
                      className="text-primary hover:underline font-medium"
                      href={`mailto:${brand.emailSupport}`}
                    >
                      {brand.emailSupport}
                    </a>
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest pt-4">
                    © {brand.year} {brand.name}. • {brand.address} • Todos los
                    derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailLayout;
