import React, { useState } from 'react';
import { Modal, Input, Button } from '../ui';
import { businessService } from '../../services';
import { Business } from '../../types';
import { useTranslation } from '../../i18n';
import { Building2 } from 'lucide-react';

export interface CreateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBiz: Business) => void;
}

export const CreateBusinessModal: React.FC<CreateBusinessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const newBiz = await businessService.createBusiness({
        user_id: `user-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        status: 'ACTIVE',
      });
      onSuccess(newBiz);
      handleClose();
    } catch (err) {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setPhone('');
    setWhatsapp('');
    setAddress('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modals.createBiz.title')} maxWidth="500px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <Input
          label={`${t('modals.createBiz.name')} *`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Metro Dental Clinic"
          required
        />

        <Input
          label={t('dashboard.profile.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Modern family dental care & hygiene"
        />

        <Input
          label={t('modals.createBiz.phone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+14155552671"
        />

        <Input
          label={t('modals.createBiz.whatsapp')}
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+14155552671"
        />

        <Input
          label={t('modals.createBiz.address')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="789 Market St, Suite 200"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <Building2 size={16} /> {t('modals.createBiz.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
