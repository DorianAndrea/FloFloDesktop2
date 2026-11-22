import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";

import {
  getMyAchievementCount,
  getChildAchievementCount,
} from "../services/achievementService";

import NavbarIcon from "./NavbarIcon";

import { getNavbarTheme } from "../config/navbarThemes";

import {
  navbarNavigation,
  getNavbarLinks,
} from "../config/navbarNavigation";

import felixLogo from "../assets/webp/felix_cara_sonriendo.webp";
import { clearFloFloCache } from "../utils/cache";

const relationshipLabels = {
  primary_caregiver: "Cuidador/a principal",
  caregiver: "Cuidador/a",
  family: "Familiar",
  occupational_therapist: "Terapeuta ocupacional",
  psychologist: "Psicólogo/a",
  speech_therapist: "Fonoaudiólogo/a",
  teacher: "Profesor/a",
  other_professional: "Otro profesional",
};

const accessProfileLabels = {
  primary_caregiver: "Cuidador/a principal",
  caregiver: "Cuidador/a",
  family: "Familiar",
  therapist: "Profesional de terapia",
  teacher: "Profesor/a",
  professional: "Otro profesional",
};

const caregiverKeys = [
  "primary_caregiver",
  "caregiver",
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const [achievementResult, setAchievementResult] =
    useState(null);

  const {
    user,
    logout,
    soundEnabled,
    setSoundEnabled,
  } = useFloFlo();

  const {
    parentChildren,
    selectedChild,
    selectedChildId,
    loadingChildren,
    selectChild,
    getChildDisplayName,
    selectedRelationshipKey,
    selectedAccessProfile,
  } = useSelectedChild();

  /*
    IDENTIFICACIÓN DEL PERFIL
  */

  const isParent = user?.role === "parent";
  const isChild = user?.role === "child";

  const isParentMode =
    isParent && Boolean(selectedChildId);

  const children = Array.isArray(parentChildren)
    ? parentChildren
    : [];

  const hasCaregiverRelationship = children.some(
    (child) =>
      caregiverKeys.includes(child.relationship_key),
  );

  const hasAnyChildRelationship =
    children.length > 0;

  const canAccessMiFamilia =
    isParent &&
    !loadingChildren &&
    (
      !hasAnyChildRelationship ||
      hasCaregiverRelationship
    );

  /*
    COLORES DINÁMICOS DEL NAVBAR
  */

  const theme = getNavbarTheme(
    user?.role,
    loadingChildren ? null : selectedAccessProfile,
  );

  const profileLabel = isChild
    ? "Niño/a"
    : isParent
      ? relationshipLabels[selectedRelationshipKey] ||
        accessProfileLabels[selectedAccessProfile] ||
        "Adulto/a de apoyo"
      : "FloFlo";

  /*
    NAVEGACIÓN SEGÚN PERFIL
  */

  const navigationLinks = getNavbarLinks({
    user,
    canAccessMiFamilia,
    isParentMode,
    selectedChildId,
  });

  /*
    CONTADOR LIGERO DE LOGROS
  */

  const canLoadAchievements =
    isChild ||
    (
      isParent &&
      !loadingChildren &&
      Boolean(selectedChildId) &&
      caregiverKeys.includes(selectedAccessProfile)
    );

  const achievementContextKey =
    user?.id && canLoadAchievements
      ? JSON.stringify([
          user.id,
          user.role,
          isParent ? selectedChildId : "self",
          isParent
            ? selectedAccessProfile
            : "child",
        ])
      : null;

  const achievementCount =
    achievementContextKey &&
    achievementResult?.contextKey ===
      achievementContextKey
      ? achievementResult.count
      : "—";

  useEffect(() => {
    let cancelled = false;

    setAchievementResult(null);

    if (!achievementContextKey) {
      return;
    }

    const loadNavbarAchievements = async () => {
      try {
        const data = isParent
          ? await getChildAchievementCount(
              selectedChildId,
            )
          : await getMyAchievementCount();

        if (cancelled) {
          return;
        }

        if (
          isParent &&
          Number(data?.child_id) !==
            Number(selectedChildId)
        ) {
          throw new Error(
            "El contador pertenece a otro perfil infantil",
          );
        }

        if (
          !Number.isInteger(data?.achievements) ||
          data.achievements < 0
        ) {
          throw new Error(
            "Contador de logros inválido",
          );
        }

        setAchievementResult({
          contextKey: achievementContextKey,
          count: data.achievements,
        });
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Error cargando logros navbar:",
            error,
          );

          setAchievementResult(null);
        }
      }
    };

    loadNavbarAchievements();

    return () => {
      cancelled = true;
    };
  }, [
    achievementContextKey,
    isParent,
    selectedChildId,
  ]);

  /*
    ACCIONES GENERALES
  */

  const closeMenus = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    clearFloFloCache();
    setAchievementResult(null);
    closeMenus();
    logout();
  };

  /*
    SELECTOR DE NIÑO/A ACTIVO
  */

  const renderSelectedChild = (
    mobile = false,
  ) => {
    if (!isParent) {
      return null;
    }

    return (
      <div
        className={`rounded-xl border px-3 py-2 ${
          mobile ? "w-full mt-2" : "mt-1"
        }`}
        style={{
          backgroundColor: theme.hover,
          borderColor: theme.border,
          color: theme.foreground,
        }}
      >
        <p className="text-xs font-semibold">
          Niño/a activo
        </p>

        {loadingChildren ? (
          <p className="text-sm font-bold">
            Cargando...
          </p>
        ) : children.length === 0 ? (
          <p className="text-sm font-bold">
            Sin niño/a asociado
          </p>
        ) : children.length > 1 ? (
          <select
            aria-label="Seleccionar niño activo"
            value={selectedChildId ?? ""}
            onChange={(event) =>
              selectChild(event.target.value)
            }
            className={`mt-1 rounded-lg border bg-white
              px-2 py-1 text-sm font-semibold ${
                mobile
                  ? "w-full"
                  : "max-w-[180px]"
              }`}
            style={{
              borderColor: theme.border,
              color: theme.foreground,
            }}
          >
            {!selectedChildId && (
              <option value="" disabled>
                Seleccionar niño/a
              </option>
            )}

            {children.map((child) => (
              <option
                key={child.id}
                value={child.id}
              >
                {getChildDisplayName(child)}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-bold">
            {getChildDisplayName(
              selectedChild || children[0],
            )}
          </p>
        )}
      </div>
    );
  };

  /*
    IDENTIFICACIÓN VISUAL DEL USUARIO
  */

  const renderUserIdentity = (
    mobile = false,
  ) => {
    if (!user) {
      return null;
    }

    return (
      <div
        className={`flex flex-col gap-1 ${
          mobile
            ? "rounded-2xl border p-4"
            : "leading-tight"
        }`}
        style={
          mobile
            ? {
                backgroundColor: theme.hover,
                borderColor: theme.border,
              }
            : undefined
        }
      >
        <span
          className="font-bold whitespace-nowrap"
          style={{
            color: theme.foreground,
          }}
        >
          Hola, {user.firstName}
        </span>

        <span
          className="text-xs font-bold
            rounded-full px-2 py-1 w-fit"
          style={{
            backgroundColor: theme.active,
            color: theme.foreground,
          }}
        >
          {profileLabel}
        </span>

        {renderSelectedChild(mobile)}
      </div>
    );
  };

  /*
    ACCESOS A LAS FUNCIONALIDADES
  */

  const renderNavigation = (
    showLabel = false,
  ) =>
    navigationLinks.map((link) => (
      <NavbarIcon
        key={link.path}
        icon={link.icon}
        label={link.label}
        to={link.path}
        end={link.end || false}
        theme={theme}
        showLabel={showLabel}
        onClick={closeMenus}
      />
    ));

  /*
    ACCIONES PERSONALES
  */

  const renderUserActions = (
    showLabel = false,
  ) => {
    if (!user) {
      return (
        <>
          <NavbarIcon
            icon={navbarNavigation.login.icon}
            label={navbarNavigation.login.label}
            to={navbarNavigation.login.path}
            theme={theme}
            showLabel
            onClick={closeMenus}
          />

          <NavbarIcon
            icon={navbarNavigation.register.icon}
            label={navbarNavigation.register.label}
            to={navbarNavigation.register.path}
            theme={theme}
            showLabel
            onClick={closeMenus}
          />
        </>
      );
    }

    return (
      <>
        <NavbarIcon
          icon={
            navbarNavigation.achievements.icon
          }
          label={
            achievementCount === "—"
              ? "Logros: contador no disponible"
              : `Logros: ${achievementCount}`
          }
          to={
            navbarNavigation.achievements.path
          }
          count={
            showLabel ? null : achievementCount
          }
          theme={theme}
          showLabel={showLabel}
          onClick={closeMenus}
        />

        <NavbarIcon
          icon={
            soundEnabled
              ? navbarNavigation.sound.enabledIcon
              : navbarNavigation.sound.disabledIcon
          }
          label={
            soundEnabled
              ? navbarNavigation.sound.enabledLabel
              : navbarNavigation.sound.disabledLabel
          }
          theme={theme}
          showLabel={showLabel}
          onClick={() =>
            setSoundEnabled(!soundEnabled)
          }
        />

        <NavbarIcon
          icon={navbarNavigation.profile.icon}
          label={navbarNavigation.profile.label}
          to={navbarNavigation.profile.path}
          theme={theme}
          showLabel={showLabel}
          onClick={closeMenus}
        />

        <NavbarIcon
          icon={navbarNavigation.logout.icon}
          label={navbarNavigation.logout.label}
          theme={theme}
          showLabel={showLabel}
          onClick={handleLogout}
        />
      </>
    );
  };

  /*
    ESTRUCTURA PRINCIPAL DEL NAVBAR
  */

  return (
    <nav
      aria-label="Navegación principal de FloFlo"
      className="sticky top-0 z-50 border-b
        shadow-sm transition-colors duration-300"
      style={{
        backgroundColor: theme.background,
        borderColor: theme.border,
        color: theme.foreground,
      }}
    >
      <div
        className="max-w-[1600px] mx-auto
          px-4 xl:px-6 py-3"
      >
        <div
          className="flex items-center
            justify-between gap-4"
        >
          {/* LOGO FLOFLO */}

          <NavLink
            to="/"
            onClick={closeMenus}
            aria-label="FloFlo, inicio"
            className="flex items-center
              gap-2 shrink-0"
          >
            <img
              src={felixLogo}
              alt=""
              className="w-11 h-11 object-contain"
            />

            <span
              className="text-2xl font-bold"
              style={{
                color: theme.foreground,
              }}
            >
              FloFlo
            </span>
          </NavLink>

          {/* NAVEGACIÓN ESCRITORIO */}

          <div
            className="hidden xl:flex flex-1
              flex-wrap items-center
              justify-center gap-1"
          >
            {renderNavigation(isChild)}
          </div>

          {/* PERFIL Y ACCIONES ESCRITORIO */}

          <div
            className="hidden xl:flex
              items-center gap-2 shrink-0"
          >
            {renderUserIdentity()}

            <div
              className="flex items-center
                gap-1"
            >
              {renderUserActions()}
            </div>
          </div>

          {/* BOTÓN MENÚ MÓVIL */}

          <div
            className="xl:hidden flex
              items-center gap-3"
          >
            {user && (
              <span
                className="hidden sm:inline
                  text-xs font-bold rounded-full
                  px-3 py-1"
                style={{
                  backgroundColor: theme.active,
                  color: theme.foreground,
                }}
              >
                {profileLabel}
              </span>
            )}

            <button
              type="button"
              aria-label={
                menuOpen
                  ? "Cerrar menú"
                  : "Abrir menú"
              }
              aria-expanded={menuOpen}
              aria-controls="floflo-mobile-menu"
              onClick={() =>
                setMenuOpen((previous) => !previous)
              }
              className="min-w-[44px]
                min-h-[44px] rounded-xl
                flex items-center justify-center
                text-xl transition-colors"
              style={{
                backgroundColor: theme.hover,
                color: theme.foreground,
              }}
            >
              {menuOpen ? (
                <FaTimes aria-hidden="true" />
              ) : (
                <FaBars aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN MÓVIL Y TABLET */}

      {menuOpen && (
        <div
          id="floflo-mobile-menu"
          className="xl:hidden border-t
            px-4 py-4
            max-h-[calc(100dvh-80px)]
            overflow-y-auto"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <div
            className="max-w-2xl
              mx-auto flex flex-col gap-4"
          >
            {renderUserIdentity(true)}

            <div>
              <p
                className="text-xs font-bold
                  uppercase tracking-wide mb-3"
                style={{
                  color: theme.foreground,
                }}
              >
                Navegación
              </p>

              <div
                className="grid grid-cols-1
                  sm:grid-cols-2 gap-2"
              >
                {renderNavigation(true)}
              </div>
            </div>

            <div
              className="border-t pt-4"
              style={{
                borderColor: theme.border,
              }}
            >
              <p
                className="text-xs font-bold
                  uppercase tracking-wide mb-3"
                style={{
                  color: theme.foreground,
                }}
              >
                Mi cuenta
              </p>

              <div
                className="grid grid-cols-1
                  sm:grid-cols-2 gap-2"
              >
                {renderUserActions(true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;