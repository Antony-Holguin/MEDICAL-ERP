import React from 'react';
import EmailLayout from './layouts/layout';
import { Button, Section, Text } from '@react-email/components';
import { ConfirmResetPasswordProps } from '../types';

export const ConfirmResetPassword: React.FC<ConfirmResetPasswordProps> = (
  props,
) => {
  const { brand, url } = props;
  return (
    <EmailLayout brand={brand}>
      <Section>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Tu contraseña ha sido actualizada
        </Text>
        <Text className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Se ha realizado el cambio de contraseña de tu cuenta correctamente. Ya
          puedes iniciar sesión con tus nuevas credenciales.
        </Text>
        <div className="flex flex-col items-center">
          <Button
            className="block w-full bg-primary hover:bg-primary/90 text-white font-semibold text-center py-3.5 rounded-lg transition-colors shadow-lg shadow-primary/20 focus:ring-4 focus:ring-primary/30 outline-none"
            href={url}
          >
            Iniciar sesión
          </Button>
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8 mt-2">
          <div className="flex items-start space-x-3 text-sm">
            <span className="material-icons text-zinc-400 dark:text-zinc-500 mt-0.5">
              info
            </span>
            <Text className="text-zinc-500 dark:text-zinc-400">
              ¿No realizaste este cambio?
              <Button
                className="text-primary font-medium hover:underline decoration-primary/30 underline-offset-4"
                href={`mailto:${brand.emailSupport}`}
              >
                Ponte en contacto con nosotros.
              </Button>
            </Text>
          </div>
        </div>
      </Section>
    </EmailLayout>
  );
};

export default ConfirmResetPassword;
