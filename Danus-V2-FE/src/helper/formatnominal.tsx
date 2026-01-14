export const formatNominal = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? new Intl.NumberFormat('id-ID').format(parseInt(num)) : '';
};