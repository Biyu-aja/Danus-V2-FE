export const formatWhatsAppNumber = (phone: string) => {
    return phone.replace(/^0/, '62').replace(/[^0-9]/g, '');
};