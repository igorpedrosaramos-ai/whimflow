import React, { useState, useEffect, useCallback } from 'react';

export type RouteType =
  | 'dashboard'
  | 'recent'
  | 'board'
  | 'doc'
  | 'agent'
  | 'templates'
  | 'trash'
  | 'presentation';

export interface RouteState {
  type: RouteType;
  path: string;
  boardId?: string;
  query: Record<string, string>;
}

/**
 * Analisa a URL atual do navegador e converte para um estado de rota tipado
 */
export function parseRoute(pathname: string = window.location.pathname, search: string = window.location.search): RouteState {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const queryParams = new URLSearchParams(search);
  const query: Record<string, string> = {};
  queryParams.forEach((value, key) => {
    query[key] = value;
  });

  // 1. Dashboard / Home (Raiz ou /dashboard)
  if (cleanPath === '/' || cleanPath === '/dashboard') {
    return { type: 'dashboard', path: cleanPath, query };
  }

  // 2. Filtro de Recentes (/recentes ou /recent)
  if (cleanPath === '/recentes' || cleanPath === '/recent') {
    return { type: 'recent', path: cleanPath, query };
  }

  // 3. Central de Templates (/templates)
  if (cleanPath === '/templates') {
    return { type: 'templates', path: cleanPath, query };
  }

  // 4. Lixeira de Quadros (/lixeira ou /trash)
  if (cleanPath === '/lixeira' || cleanPath === '/trash') {
    return { type: 'trash', path: cleanPath, query };
  }

  // 5. Agente IA em Tela Cheia (/ia, /agent, /assistente)
  if (cleanPath === '/ia' || cleanPath === '/agent' || cleanPath === '/assistente') {
    return { type: 'agent', path: cleanPath, query };
  }

  // 6. Editor de Mapa Mental / Canvas (/board/:id ou /quadro/:id)
  const boardMatch = cleanPath.match(/^\/(?:board|quadro)\/([^/?#]+)$/i);
  if (boardMatch) {
    return {
      type: 'board',
      path: cleanPath,
      boardId: decodeURIComponent(boardMatch[1]),
      query
    };
  }

  // 7. Editor de Documento Executivo (/doc/:id, /documento/:id ou /doc)
  const docMatch = cleanPath.match(/^\/(?:doc|documento)(?:\/([^/?#]+))?$/i);
  if (docMatch) {
    return {
      type: 'doc',
      path: cleanPath,
      boardId: docMatch[1] ? decodeURIComponent(docMatch[1]) : undefined,
      query
    };
  }

  // 8. Modo Apresentação (/present/:id ou /apresentacao/:id)
  const presentMatch = cleanPath.match(/^\/(?:present|apresentacao)\/([^/?#]+)$/i);
  if (presentMatch) {
    return {
      type: 'presentation',
      path: cleanPath,
      boardId: decodeURIComponent(presentMatch[1]),
      query
    };
  }

  // Fallback padrão: Dashboard
  return { type: 'dashboard', path: '/', query };
}

/**
 * Navega para uma nova rota, atualizando o endereço no navegador via History API
 */
export function navigate(to: string, options?: { replace?: boolean }) {
  if (typeof window === 'undefined') return;

  const currentFull = window.location.pathname + window.location.search;
  if (currentFull === to) return;

  if (options?.replace) {
    window.history.replaceState({}, '', to);
  } else {
    window.history.pushState({}, '', to);
  }

  window.dispatchEvent(new Event('popstate'));
}

/**
 * Hook customizado para consumir e reagir a mudanças de rota e botões de avançar/voltar do navegador
 */
export function useRouter() {
  const [route, setRoute] = useState<RouteState>(() => {
    if (typeof window === 'undefined') {
      return { type: 'dashboard', path: '/', query: {} };
    }
    return parseRoute(window.location.pathname, window.location.search);
  });

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname, window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = useCallback((to: string, options?: { replace?: boolean }) => {
    navigate(to, options);
  }, []);

  return {
    route,
    navigate: navigateTo,
    path: route.path,
    boardId: route.boardId,
    type: route.type,
    query: route.query
  };
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
}

/**
 * Componente de Link nativo acessível com suporte a clique normal, Cmd/Ctrl+Click e botão direito do mouse
 */
export const Link: React.FC<LinkProps> = ({ to, replace, onClick, children, ...rest }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Se for clique com modificador (Ctrl, Cmd, Shift, Alt) ou botão do meio, permite o comportamento padrão de abrir em nova aba
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || rest.target === '_blank') {
      return;
    }

    e.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};
