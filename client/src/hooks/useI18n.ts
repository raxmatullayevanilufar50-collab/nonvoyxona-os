import { uz, t as translate } from "@shared/i18n";

/**
 * Hook to use Uzbek translations in React components
 * Returns translation strings and translation function
 */
export const useI18n = () => {
  return {
    t: translate,
    strings: uz,
  };
};

export default useI18n;
