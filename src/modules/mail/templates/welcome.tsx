import React from 'react';
import EmailLayout from './layouts/layout';
import { Text, Section, Button, Hr } from '@react-email/components';
import { WelcomeEmailProps } from '../types';

export const Email: React.FC<WelcomeEmailProps> = ({
  fullName,
  loginUrl,
  siteName = 'Facts by Urbeecode',
  brand,
}) => {
  return (
    <EmailLayout brand={brand}>
      <Section className="text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="material-icons text-primary text-3xl">
            waving_hand
          </span>
        </div>
        <Text className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Bienvenido a <span className="text-primary">{siteName}</span>!
        </Text>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
          Tu cuenta ha sido creada exitosamente. Ya puedes acceder para comenzar
          a utilizar todas nuestras herramientas.
        </p>
        <div className="pt-4">
          <Button
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-base hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
            href={loginUrl}
          >
            Ir a mi cuenta
          </Button>
        </div>
      </Section>
    </EmailLayout>
  );
};

export default Email;
