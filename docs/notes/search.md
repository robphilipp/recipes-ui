# searching

Basic search from the menu bar allows the user to search recipe names and tags for a collection of terms. Specifically, given a set of search terms, finds all the recipes whose name or tags contain one or more of those terms. 

Advanced search (in progress) provides the user with a richer search.

## basic search

Given a set of search terms, finds all the recipes whose name or tags contain one or more of those words. These search terms can be partial words, sequences of characters, or regular expressions.

The [useSearch](lib/useSearch.tsx) hook manages the basic search state, which is composed of the current search term and the accumulated set of search terms. The current search term provides a mechanism for performing searches as the user types. The accumulated set of search terms is a set of search terms the user has entered. The `useSearch` hook only manages the search state, it does **not** perform the actual search or define the semantics of the search.

In addition to providing the current and accumulated search terms, the [useSearch](lib/useSearch.tsx) hook also exposes methods for managing the current and accumulated search terms. For example, the `addAccumulated` method adds a search term to the accumulated search terms, the `deleteAccumulated` removes a search term from the accumulated search terms, and the `clearAccumulated` function removes all the accumulated search terms.

Components that use the [useSearch](lib/useSearch.tsx) hook must be a child of the [&lt;SearchProvider&gt;](lib/useSearch.tsx) component, and can respond to change in the search state by accessing the exposed `current` or `accumulated` variables. **Importantly**, it is the child components, **rather** than the [useSearch](lib/useSearch.tsx), that listen for changes (e.g. through the `useEffect` dependencies) to the search state and respond by making an API call to the desired search method.

The search methods are implemented in the [recipes.ts] module (lib/recipes.ts) and are accessible thorough the handlers defined in the [pages/api/recipes](pages/api/recipes) directory. You can add search methods by creating a new handler that calls one or more new or existing methods in the [recipes.ts](lib/recipes.ts) module.

## advanced search

The advanced search provides a richer semantic for searching recipes. Unlike the basic search, which is constrained to search recipe names and tags, the advanced search can search all parts of the recipe using richer semantics.


# development notes

1. select 
