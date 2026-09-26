import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../../services/clientService';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const clientSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  contact: z.string().min(1, "Primary contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  industry: z.string().optional(),
});

export default function ClientForm({ onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(clientSchema),
  });

  const mutation = useMutation({
    mutationFn: clientService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error('Failed to create client');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Company Name *</label>
        <Input {...register('company')} error={errors.company?.message} placeholder="Stark Industries" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Primary Contact *</label>
          <Input {...register('contact')} error={errors.contact?.message} placeholder="Tony Stark" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Email *</label>
          <Input type="email" {...register('email')} error={errors.email?.message} placeholder="tony@stark.com" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Phone *</label>
          <Input {...register('phone')} error={errors.phone?.message} placeholder="+1 555 123 4567" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Industry</label>
          <Input {...register('industry')} placeholder="Technology" />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Client'}
        </Button>
      </div>
    </form>
  );
}
