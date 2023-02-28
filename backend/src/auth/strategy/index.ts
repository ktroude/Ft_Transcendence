// cette class sert a valider les token retournes par signin et signup
// ca s'appel une strategy en code, d'ou le nom du dossier
// la strategy determine le moyen de connexion, ici on va se servir de token
// mais il existe d'autres strat comme login via FB ou son compte google


export * from './jwt.strategy';