"use client";
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import "@/app/ui/fonts";

// --- PALETA DE COLORES ---
const PRIMARY_COLOR = "#333333"; // Texto principal (Gris oscuro casi negro)
const ACCENT_COLOR = "#074d8f"; // Violeta/Azul (Similar al de la imagen del CV)
const SUBTEXT_COLOR = "#666666"; // Gris medio para detalles
const DIVIDER_COLOR = "#E5E7EB"; // Gris muy claro para líneas sutiles

type ActaEntregaData = {
  folio: string;
  receptor: {
    nombre: string;
    run: string;
    domicilio: string;
    tramo: string;
    folioRSH: string;
    telefono: string;
    fechaSolicitud: string;
    relacion: string;
  };
  beneficiario: {
    nombre: string;
    run: string;
    edad: string;
    domicilio: string;
    tramo: string;
    folioRSH: string;
    telefono: string;
    fechaSolicitud: string;
  };
  numeroEntrega: number;
  beneficios: Beneficio[];
  justificacion: string;
  profesional: {
    nombre: string;
    cargo: string;
    fecha: string;
    fechaISO: string;
  };
};

type Beneficio = {
  nombre: string;
  codigo: string;
  detalles: { label: string; value: string }[];
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Geist",
    fontSize: 10,
    color: PRIMARY_COLOR,
    lineHeight: 1.5,
  },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: "column",
  },
  titleName: {
    fontSize: 24,
    fontWeight: "black",
    textTransform: "uppercase",
    color: "#111",
    letterSpacing: 0.3,
  },
  titleRole: {
    fontSize: 12,
    color: ACCENT_COLOR,
    fontWeight: "bold",
    marginTop: 10,
    textTransform: "uppercase",
  },
  headerContact: {
    marginTop: 0,
    flexDirection: "row",
    fontSize: 9,
    color: SUBTEXT_COLOR,
  },
  headerFolio: {
    marginTop: 0,
    flexDirection: "row",
    fontSize: 10,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },
  // Logo
  logoContainer: {
    width: 80,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10.5,
  },

  // --- SECCIONES ---
  sectionContainer: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.8,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLOR,
    color: "#fff",
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },

  // --- GRILLA DE DATOS ---
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  infoItem: {
    width: "35%", // Dos columnas
    marginBottom: 8,
    // borderBottomWidth: 1, // Solo para descargar la plantilla del acta vacía
    borderBottomColor: DIVIDER_COLOR,
  },
  infoItemLarge: {
    width: "65%",
    marginBottom: 8,
    // borderBottomWidth: 1, // Solo para descargar la plantilla del acta vacía
    borderBottomColor: DIVIDER_COLOR,
  },
  label: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 10,
  },
  value: {
    fontWeight: "normal",
    color: SUBTEXT_COLOR,
  },

  // --- LISTA DE BENEFICIOS ---
  benefitItem: {
    marginBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER_COLOR,
    paddingBottom: 6,
  },
  benefitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    // marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },
  benefitCode: {
    fontSize: 9,
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  benefitMeta: {
    fontSize: 9,
    color: "#9CA3AF",
  },
  benefitDetailsList: { marginLeft: 8, marginTop: 1 },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  bullet: { width: 10, fontSize: 10, color: ACCENT_COLOR },
  detailText: {
    fontSize: 9,
    color: SUBTEXT_COLOR,
  },

  // --- FIRMAS Y FOOTER ---
  signatureSection: {
    position: "absolute",
    bottom: 70,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 9,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },
  signatureSubtext: {
    fontSize: 8,
    color: SUBTEXT_COLOR,
  },

  legalFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

export default function ActaEntregaCompleta({
  data,
}: {
  data: ActaEntregaData;
}) {
  // Función auxiliar para no repetir código en filas simples
  const InfoItem = ({ label = "", value = "", fullWidth = false }) => (
    <View style={fullWidth ? styles.infoItemLarge : styles.infoItem}>
      <Text style={styles.label}>
        {label}: <Text style={styles.value}>{value}</Text>
      </Text>
    </View>
  );

  // --- Cálculo de ordinal de entrega y condicional de beneficiario ---
  const numeroEntrega = data?.numeroEntrega ?? undefined;

  const ordinalEntrega =
    typeof numeroEntrega === "number"
      ? ["Primera", "Segunda", "Tercera"][numeroEntrega - 1] ||
        `${numeroEntrega}ª`
      : undefined;

  const shouldDisplayReceptor = () => {
    return data?.receptor?.nombre.trim() !== "" && data?.receptor?.run !== "";
  };

  const shouldWrapContent = () => {
    if (data.receptor?.run) {
      return data.beneficios.length > 3;
    }
    return data.beneficios.length > 4;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* === HEADER ESTILO PERFIL === */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.titleName}>ACTA DE ENTREGA</Text>
            <Text style={styles.titleRole}>Ayuda Asistencial Municipal</Text>
            <View style={styles.headerContact}>
              <Text>{data.profesional.fecha} </Text>
              <Text>| El Quisco, Chile |</Text>
              {ordinalEntrega && (
                <Text style={{ fontWeight: "bold" }}>
                  <Text> {`Entrega: ${ordinalEntrega} del año`}</Text>
                </Text>
              )}
            </View>
            <View style={styles.headerFolio}>
              <Text>Folio: {data.folio}</Text>
            </View>
          </View>

          {/* Círculo de Logo (Simulando la foto) */}
          <View style={styles.logoContainer}>
            <Image src="/elquisco-grayscaled.png" style={{ height: "100%" }} />
            <Text style={{ fontSize: 7, color: "#999", marginTop: 2 }}>
              Municipalidad
            </Text>
            <Text style={{ fontSize: 7, color: "#999", marginTop: 1 }}>
              El Quisco
            </Text>
          </View>
        </View>

        {/* === INTRODUCCIÓN DEL BENEFICIARIO === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Información del Beneficiario</Text>
          <View style={styles.infoGrid}>
            <InfoItem
              label="Nombre"
              value={data.beneficiario?.nombre}
              fullWidth
            />
            <InfoItem label="R.U.N" value={data.beneficiario?.run} />
            <InfoItem
              label="Domicilio"
              value={data.beneficiario?.domicilio}
              fullWidth
            />
            <InfoItem label="Tramo" value={data.beneficiario?.tramo} />
            {data.beneficiario?.telefono && (
              <InfoItem
                label="Teléfono"
                value={data.beneficiario?.telefono}
                fullWidth
              />
            )}
            {data.beneficiario?.telefono && data.beneficiario?.folioRSH && (
              <InfoItem label="Folio" value={data.beneficiario?.folioRSH} />
            )}
            {data.beneficiario?.edad && (
              <InfoItem
                label="Edad"
                value={data.beneficiario?.edad}
                fullWidth
              />
            )}
            {!data.beneficiario?.telefono && data.beneficiario?.folioRSH && (
              <InfoItem label="Folio" value={data.beneficiario?.folioRSH} />
            )}
            {/* <InfoItem label="Folio" value={data.beneficiario?.folioRSH} /> */}
          </View>
        </View>

        {/* === INFORMACIÓN DEL RECEPTOR (CONDICIONAL) === */}
        {shouldDisplayReceptor() && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Información del Receptor</Text>
            <View style={styles.infoGrid}>
              <InfoItem
                label="Nombre"
                value={data.receptor?.nombre}
                fullWidth
              />
              <InfoItem label="R.U.N" value={data.receptor?.run} />
              <InfoItem
                label="Domicilio"
                value={data.receptor?.domicilio}
                fullWidth
              />
              <InfoItem label="Tramo" value={data.receptor?.tramo} />
              <InfoItem
                label="Teléfono"
                value={data.receptor?.telefono}
                fullWidth
              />
              <InfoItem label="Folio" value={data.receptor?.folioRSH} />
              {data.receptor?.relacion && (
                <InfoItem
                  label="Relación con beneficiario"
                  value={data.receptor.relacion}
                  fullWidth
                />
              )}
            </View>
          </View>
        )}

        {/* === DETALLE DE ENTREGA (BENEFICIOS) === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Detalle de la Entrega</Text>

          <View
            style={[
              shouldWrapContent()
                ? {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    minHeight: 105,
                  }
                : {
                    flexDirection: "column",
                    minHeight: 105,
                  },
            ]}
          >
            {Array.isArray(data.beneficios) && data.beneficios.length > 0 ? (
              data.beneficios.map(
                (
                  beneficio: Beneficio,
                  index: number,
                  originalArray: Beneficio[],
                ) => {
                  const columns = shouldWrapContent() ? 2 : 1;
                  const startLastRow =
                    columns * Math.floor((originalArray.length - 1) / columns);
                  const isInLastRow = index >= startLastRow;

                  const rowStyle = [
                    styles.benefitItem,
                    { width: shouldWrapContent() ? "50%" : "100%" },
                    isInLastRow
                      ? {
                          borderBottomWidth: 0,
                          marginBottom: 4,
                          paddingBottom: 0,
                        }
                      : {},
                  ];

                  return (
                    <View style={rowStyle} key={index}>
                      <View style={styles.benefitHeader}>
                        <Text style={styles.benefitTitle}>
                          {beneficio.nombre}
                        </Text>
                        {!shouldWrapContent() && (
                          <Text style={styles.benefitCode}>
                            {beneficio.codigo || "Ayuda Social"}
                          </Text>
                        )}
                      </View>

                      <View style={styles.benefitDetailsList}>
                        {Array.isArray(beneficio.detalles) &&
                          beneficio.detalles.map((detalle, idx) => (
                            <View style={styles.bulletPoint} key={idx}>
                              <Text style={styles.bullet}>•</Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                }}
                              >
                                {typeof detalle === "object" &&
                                detalle !== null ? (
                                  <>
                                    {detalle.label ? (
                                      <Text
                                        style={{
                                          fontWeight: "bold",
                                          color: "#444",
                                        }}
                                      >
                                        {String(detalle.label)}:{" "}
                                      </Text>
                                    ) : null}
                                    <Text style={styles.value}>
                                      {String(detalle.value)}
                                    </Text>
                                  </>
                                ) : (
                                  <Text style={styles.value}>
                                    {String(detalle)}
                                  </Text>
                                )}
                              </View>
                            </View>
                          ))}
                      </View>
                    </View>
                  );
                },
              )
            ) : (
              <Text style={{ color: "#999" }}>
                No se registran entregas en este folio.
              </Text>
            )}
          </View>

          {/* Mensaje si no hay nada */}
          {Object.values(data.beneficios).every((v) => v === null) && (
            <Text style={{ color: "#999" }}>
              No se registran entregas en este folio.
            </Text>
          )}
        </View>

        {/* === JUSTIFICACIÓN === */}
        {data.justificacion && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              Observaciones / Justificación
            </Text>
            <Text
              style={{
                color: SUBTEXT_COLOR,
                textAlign: "justify",
                paddingHorizontal: 8,
              }}
            >
              {data.justificacion}
            </Text>
          </View>
        )}

        {/* === FIRMAS (PROFESIONAL Y USUARIO) === */}
        <View style={styles.signatureSection}>
          {/* Firma Profesional */}
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>{data.profesional.nombre}</Text>
            <Text style={styles.signatureSubtext}>
              {data.profesional.cargo}
            </Text>
          </View>

          {/* Firma Usuario */}
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>{data.receptor.nombre}</Text>
            <Text style={styles.signatureSubtext}>
              Firma de conformidad y recepción
            </Text>
          </View>
        </View>

        {/* === FOOTER LEGAL === */}
        <Text style={styles.legalFooter}>
          I. Municipalidad de El Quisco - Departamento Social - Av. Isidoro
          Dubournais 413
          {"\n"}Documento generado electrónicamente el{" "}
          {new Date().toLocaleDateString()}.
        </Text>
      </Page>
    </Document>
  );
}