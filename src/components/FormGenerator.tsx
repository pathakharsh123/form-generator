import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import 'tailwindcss/tailwind.css';

interface Field {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: { pattern: string; message: string };
}

interface FormSchema {
  formTitle: string;
  formDescription?: string;
  fields: Field[];
}

const sampleSchema: FormSchema = {
  formTitle: 'Project Requirements Survey',
  formDescription: 'Please fill out this survey about your project needs',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name',
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      placeholder: 'you@example.com',
      validation: {
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        message: 'Please enter a valid email address',
      },
    },
    {
      id: 'companySize',
      type: 'select',
      label: 'Company Size',
      required: true,
      options: [
        { value: '1-50', label: '1-50 employees' },
        { value: '51-200', label: '51-200 employees' },
        { value: '201-1000', label: '201-1000 employees' },
        { value: '1000+', label: '1000+ employees' },
      ],
    },
  ],
};

const FormGenerator: React.FC = () => {
  const [jsonSchema, setJsonSchema] = useState<FormSchema>(sampleSchema);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<Record<string, any> | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      setJsonSchema(parsed);
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonSchema, null, 2));
    alert('JSON copied to clipboard!');
  };

  const downloadSubmission = () => {
    if (submissionData) {
      const blob = new Blob([JSON.stringify(submissionData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'form_submission.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object(
        jsonSchema.fields.reduce((acc, field) => {
          if (field.required) {
            acc[field.id] = z.string().nonempty(`${field.label} is required`);
          }
          if (field.validation) {
            acc[field.id] = acc[field.id]?.regex(
              new RegExp(field.validation.pattern),
              field.validation.message
            );
          }
          return acc;
        }, {} as any)
      )
    ),
  });

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log('Form Submitted:', data);
    setSubmissionData(data);
    setFormSubmitted(true);
  };

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold">{darkMode ? 'Dark Mode' : 'Light Mode'}</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          {darkMode ? 'Toggle to Light Mode' : 'Toggle to Dark Mode'}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <textarea
            className={`w-full h-96 border-2 rounded-lg p-4 text-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'} shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out`}
            value={JSON.stringify(jsonSchema, null, 2)}
            onChange={handleSchemaChange}
          />

          <button
            onClick={copyJsonToClipboard}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out"
          >
            Copy Form JSON
          </button>
        </div>

        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-semibold">{jsonSchema.formTitle}</h2>
            {jsonSchema.formDescription && <p className="text-lg text-gray-600">{jsonSchema.formDescription}</p>}
            {jsonSchema.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block text-lg font-medium">{field.label}</label>
                {field.validation && field.validation.message && (
                  <p className="text-sm text-red-500">{field.validation.message}</p>
                )}
                {field.type === 'text' || field.type === 'email' ? (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...register(field.id)}
                    className={`w-full border-2 rounded-lg p-4 text-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'} shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    {...register(field.id)}
                    className={`w-full border-2 rounded-lg p-4 text-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'} shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out`}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}
                {errors[field.id]?.message && (
                  <p className="text-red-500 text-sm">{errors[field.id]?.message as string}</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Submit
            </button>
          </form>

          {formSubmitted && (
            <div className="mt-6">
              <p className="text-green-500">Form submitted successfully!</p>
              <button
                onClick={downloadSubmission}
                className="mt-4 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-300 ease-in-out"
              >
                Download Submission as JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormGenerator;
