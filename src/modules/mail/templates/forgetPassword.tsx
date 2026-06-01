import { Section, Text, Button } from '@react-email/components';
import { ForgetPasswordEmailProps } from '../types';
import EmailLayout from './layouts/layout';

export const ForgetPasswordEmail: React.FC<ForgetPasswordEmailProps> = (
  props,
) => {
  const { url, brand } = props;
  return (
    <EmailLayout brand={brand}>
      <Section>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Restablecer contraseña
        </Text>
        <Text className="text-slate-600 dark:text-slate-400 leading-relaxed text-center mb-8">
          Recibimos una solicitud para cambiar tu contraseña. Haz clic en el
          botón de abajo para elegir una nueva credencial de acceso.
        </Text>
        <div className="flex flex-col items-center">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 text-center shadow-md shadow-primary/10 active:scale-[0.98]"
            href={url}
          >
            Restablecer contraseña
          </Button>
        </div>
        <div className="mt-10 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10 flex items-start gap-3">
          <span className="material-icons text-primary text-xl mt-0.5">
            info
          </span>
          <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-snug">
            Por tu seguridad, este enlace expirará pronto. Si no solicitaste
            este cambio, puedes ignorar este mensaje de forma segura.
          </p>
        </div>
      </Section>
    </EmailLayout>
  );
};

export default ForgetPasswordEmail;
