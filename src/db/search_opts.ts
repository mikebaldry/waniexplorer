export const searchOpts = {
  fields: ['primarySearch', 'secondarySearch'],
  storeFields: ['id', 'type', 'level', 'characters', 'description', 'related'], 
  searchOptions: {
    boost: { primarySearch: 2 }
  }
};