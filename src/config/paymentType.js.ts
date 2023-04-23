export enum PaymentType {
    CASH = 1, // Bon fiscal platit cu numerar
    CARD = 2, // Bon fiscal platit cu cardul
    BANK_TRANSFER = 3, // Factura platita prin transfer bancar
    CASH_RECEIPT = 4, // Plata numerar cu chitanta
    CASH_ON_DELIVERY = 5, // Ramburs
    CARD_ONLINE = 6, // Plata cu cardul online
    CARD_PLATFORMS = 7, // Plata cu platforme distributie si plata (Emag)
    HOLIDAY_VOUCHER_CARD = 8, // Plata cu voucher de vacanta (card)
    HOLIDAY_VOUCHER_TICKET = 9, // Plata cu voucher de vacanta (ticket)
}
