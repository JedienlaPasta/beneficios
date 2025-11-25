import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Registramos fuentes estándar
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// --- PALETA DE COLORES (Estilo CV Moderno) ---
const PRIMARY_COLOR = "#333333"; // Texto principal (Gris oscuro casi negro)
const ACCENT_COLOR = "#074d8f"; // Violeta/Azul (Similar al de la imagen del CV)
const SUBTEXT_COLOR = "#666666"; // Gris medio para detalles
const DIVIDER_COLOR = "#E5E7EB"; // Gris muy claro para líneas sutiles

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: PRIMARY_COLOR,
    lineHeight: 1.5,
  },

  // --- HEADER ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: "column",
  },
  titleName: {
    fontSize: 24, // Grande como "KELVIN MAI"
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#111",
    letterSpacing: 0.5,
  },
  titleRole: {
    fontSize: 12,
    color: ACCENT_COLOR,
    fontWeight: "bold",
    marginTop: 12,
    textTransform: "uppercase",
  },
  headerContact: {
    marginTop: 3,
    flexDirection: "row",
    fontSize: 9,
    color: SUBTEXT_COLOR,
  },
  // Logo circular estilo foto de perfil
  logoContainer: {
    width: 80,
    height: 45,
    // borderRadius: 35,
    // backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10.5,
    // overflow: "hidden",
  },

  // --- SECCIONES (Estilo "SKILLS", "EXPERIENCE") ---
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#18181a",
    borderBottomWidth: 2, // La línea gruesa debajo del título
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 4,
    marginBottom: 10,
    letterSpacing: 1,
  },

  // --- GRILLA DE DATOS (Para reemplazar la tabla) ---
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "35%", // Dos columnas
    marginBottom: 8,
  },
  infoItemLarge: {
    width: "65%",
    marginBottom: 8,
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

  // --- LISTA DE BENEFICIOS (Estilo "Experience Items") ---
  benefitItem: {
    marginBottom: 12,
  },
  benefitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: ACCENT_COLOR, // Título en color (ej: "Pañales")
  },
  benefitMeta: {
    fontSize: 9,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  benefitDetailsList: {
    marginLeft: 10,
    marginTop: 2,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: ACCENT_COLOR,
  },

  // --- FIRMAS Y FOOTER ---
  signatureSection: {
    marginTop: 40,
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
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
  },
});

export default function ActaEntregaCompleta({ data }) {
  // Función auxiliar para no repetir código en filas simples
  const InfoItem = ({ label = "", value = "", fullWidth = false }) => (
    <View style={fullWidth ? styles.infoItemLarge : styles.infoItem}>
      <Text style={styles.label}>
        {label}: <Text style={styles.value}>{value}</Text>
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* === HEADER ESTILO PERFIL === */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.titleName}>ACTA DE ENTREGA</Text>
            <Text style={styles.titleRole}>Ayuda Asistencial Municipal</Text>

            <View style={styles.headerContact}>
              <Text style={{ fontWeight: "bold", color: "#18181a" }}>
                Folio: {data.folio} |{" "}
              </Text>
              <Text>El Quisco, Chile | </Text>
              <Text>{data.profesional.fecha}</Text>
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

        {/* === INTRODUCCIÓN (RECEPTOR) === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL RECEPTOR</Text>
          <View style={styles.infoGrid}>
            <InfoItem label="Nombre" value={data.receptor.nombre} fullWidth />
            <InfoItem label="R.U.N" value={data.receptor.run} />
            <InfoItem
              label="Domicilio"
              value={data.receptor.domicilio}
              fullWidth
            />
            <InfoItem label="Tramo RSH" value={data.receptor.tramo} />
            <InfoItem
              label="Teléfono"
              value={data.receptor.telefono}
              fullWidth
            />
            <InfoItem label="Folio RSH" value={data.receptor.folioRSH} />
          </View>
        </View>

        {/* === INTRODUCCIÓN (BENEFICIARIO) === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL BENEFICIARIO</Text>
          <View style={styles.infoGrid}>
            <InfoItem label="Nombre" value={data.receptor.nombre} fullWidth />
            <InfoItem label="R.U.N" value={data.receptor.run} />
            <InfoItem
              label="Domicilio"
              value={data.receptor.domicilio}
              fullWidth
            />
            <InfoItem label="Tramo RSH" value={data.receptor.tramo} />
            <InfoItem
              label="Teléfono"
              value={data.receptor.telefono}
              fullWidth
            />
            <InfoItem label="Folio RSH" value={data.receptor.folioRSH} />
          </View>
        </View>

        {/* === DETALLE DE ENTREGA (BENEFICIOS) === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>DETALLE DE LA ENTREGA</Text>

          {/* PAÑALES */}
          {data.beneficios.panales && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitHeader}>
                <Text style={styles.benefitTitle}>Pañales</Text>
                <Text style={styles.benefitMeta}>Insumo Médico</Text>
              </View>
              <View style={styles.benefitDetailsList}>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.value}>
                    Cantidad entregada: {data.beneficios.panales.cantidad}{" "}
                    unidades
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.value}>
                    Especificación: Talla {data.beneficios.panales.talla} (
                    {data.beneficios.panales.adulto ? "Adulto" : "Niño"})
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* VALE GAS */}
          {data.beneficios.valeGas && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitHeader}>
                <Text style={styles.benefitTitle}>Vale de Recarga de Gas</Text>
                <Text style={styles.benefitMeta}>Combustible</Text>
              </View>
              <View style={styles.benefitDetailsList}>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.value}>
                    Código único: {data.beneficios.valeGas.codigo}
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.value}>Capacidad: 15 Kg</Text>
                </View>
              </View>
            </View>
          )}

          {/* TARJETA COMIDA */}
          {data.beneficios.tarjetaComida && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitHeader}>
                <Text style={styles.benefitTitle}>Tarjeta de Alimentación</Text>
                <Text style={styles.benefitMeta}>Subsidio</Text>
              </View>
              <View style={styles.benefitDetailsList}>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.value}>
                    Nro. Tarjeta: {data.beneficios.tarjetaComida.codigo}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* OTROS */}
          {/* {data.beneficios.otros && (
            <View style={styles.benefitItem}>
              <View style={styles.benefitHeader}>
                <Text style={styles.benefitTitle}>Ayuda Complementaria</Text>
                <Text style={styles.benefitMeta}>Otros</Text>
              </View>
              <View style={styles.benefitDetailsList}>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.value}>
                    {data.beneficios.otros.descripcion}
                  </Text>
                </View>
              </View>
            </View>
          )} */}

          {/* Mensaje si no hay nada */}
          {Object.values(data.beneficios).every((v) => v === null) && (
            <Text style={{ color: "#999", fontStyle: "italic" }}>
              No se registran entregas en este folio.
            </Text>
          )}
        </View>

        {/* === JUSTIFICACIÓN === */}
        {data.justificacion && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              OBSERVACIONES / JUSTIFICACIÓN
            </Text>
            <Text style={{ color: SUBTEXT_COLOR, textAlign: "justify" }}>
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
          Dubournais 123
          {"\n"}Documento generado electrónicamente el{" "}
          {new Date().toLocaleDateString()}.
        </Text>
      </Page>
    </Document>
  );
}
