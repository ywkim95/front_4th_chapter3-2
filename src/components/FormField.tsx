import { FormControl, FormLabel } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

const FormField = ({ label, children }: FormFieldProps) => (
  <FormControl>
    <FormLabel>{label}</FormLabel>
    {children}
  </FormControl>
);

export default FormField;
