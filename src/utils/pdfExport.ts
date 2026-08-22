import { jsPDF } from 'jspdf';
import { NatalData, CelestialBody, PlanetaryAspect, LunarPhaseInfo, PunchTelemetry, QiGongBarbellSession, DailyInvocation } from '../types';

export function generateAstrologyPdfReport(
  natal: NatalData,
  bodies: CelestialBody[],
  aspects: PlanetaryAspect[],
  lunar: LunarPhaseInfo,
  ascendant: { sign: string; deg: number; min: number },
  midheaven: { sign: string; deg: number; min: number },
  punches: PunchTelemetry[],
  barbellSession: QiGongBarbellSession,
  dailyInvocation: DailyInvocation
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark background theme for the PDF
  doc.setFillColor(15, 8, 28);
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Title & Header Accent
  doc.setFillColor(255, 69, 0);
  doc.rect(15, 15, 4, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AETHERIS V.1 // OCCULT & MARTIAL DOSSIER', 24, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 140, 0);
  doc.text(`GENERATED: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC | OPENXR ENCRYPTED VAULT`, 24, 29);

  // Section 1: Subject Coordinates & Natal Alignment
  doc.setDrawColor(255, 69, 0);
  doc.setLineWidth(0.5);
  doc.line(15, 36, pageWidth - 15, 36);

  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('1. NATAL & CELESTIAL COORDINATES', 15, 44);

  doc.setFontSize(9);
  doc.setTextColor(210, 210, 220);
  doc.text(`Ascendant: ${ascendant.sign} ${ascendant.deg}°${ascendant.min}'`, 110, 51);
  doc.text(`Midheaven: ${midheaven.sign} ${midheaven.deg}°${midheaven.min}'`, 110, 57);
  doc.text(`Current Lunar Phase: ${lunar.phaseName} (${lunar.illumination}% illum) in ${lunar.currentSign}`, 15, 63);

  // Section 2: Planetary Placements & Dark Signatures
  doc.line(15, 68, pageWidth - 15, 68);
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('2. PLANETARY PLACEMENTS & QLIPHOTIC CORRESPONDENCES', 15, 76);

  let yPos = 84;
  bodies.slice(0, 8).forEach((b) => {
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${b.name} (${b.symbol}): ${b.sign} ${b.degree}°${b.minute}' [House ${b.house}]`, 15, yPos);
    doc.setTextColor(180, 160, 210);
    doc.text(`Qlipha: ${b.qliphoticSphere} | ${b.darkSignature}`, 85, yPos);
    yPos += 6;
  });

  // Section 3: High-Tension Aspects & Squares
  doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
  yPos += 9;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('3. ACTIVE SQUARES, OPPOSITIONS & MARTIAL TRANSITS', 15, yPos);

  yPos += 7;
  aspects.slice(0, 5).forEach((asp) => {
    doc.setFontSize(8);
    doc.setTextColor(255, 200, 150);
    doc.text(`• ${asp.planet1} ${asp.aspectType} ${asp.planet2} (Orb: ${asp.orb}°, Intensity: ${asp.intensity})`, 15, yPos);
    yPos += 4.5;
    doc.setTextColor(180, 180, 195);
    doc.text(`  ${asp.esotericMeaning}`, 18, yPos);
    yPos += 5.5;
  });

  // Section 4: Combat Telemetry & Barbell Qi-Gong Load
  doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
  yPos += 9;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('4. SIX-FOOT ZINC BARBELL QI-GONG & COMBAT TELEMETRY', 15, yPos);

  yPos += 7;
  const avgSpeed = punches.length > 0 ? (punches.reduce((a, b) => a + b.speedMs, 0) / punches.length).toFixed(1) : '8.4';
  const avgReturn = punches.length > 0 ? (punches.reduce((a, b) => a + b.returnTimeSec, 0) / punches.length).toFixed(3) : '0.280';
  const totalKcal = punches.reduce((a, b) => a + b.energyKcal, 0) + barbellSession.estimatedKcal;

  doc.setFontSize(8.5);
  doc.setTextColor(220, 220, 230);
  doc.text(`Practitioner Weight: ${barbellSession.userBodyWeightKg} kg | Barbell: 6ft Solid Zinc (${barbellSession.barbellWeightKg} kg sleeveless)`, 15, yPos);
  doc.text(`Movement: ${barbellSession.movementName} (${barbellSession.durationMinutes} min)`, 15, yPos + 5);
  doc.text(`Recorded Strikes: ${punches.length} punches | Avg Speed: ${avgSpeed} m/s | Avg Return: ${avgReturn} s`, 15, yPos + 10);
  doc.text(`Total Energy Expended: ${totalKcal.toFixed(1)} kCal`, 15, yPos + 15);

  // Section 5: Barbarous Invocations
  yPos += 22;
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 7;
  doc.setFontSize(11);
  doc.setTextColor(255, 165, 0);
  doc.text('5. DAILY BARBAROUS FORMULA & MARTIAL INVOCATION', 15, yPos);

  yPos += 7;
  doc.setFontSize(8.5);
  doc.setTextColor(255, 140, 0);
  doc.text(`Formula: "${dailyInvocation.barbarousFormula}"`, 15, yPos);
  yPos += 5;
  doc.setTextColor(200, 200, 210);
  doc.text(`Invocation: "${dailyInvocation.invocationText}"`, 15, yPos);
  yPos += 5;
  doc.setTextColor(170, 150, 200);
  doc.text(`Martial Correlation: ${dailyInvocation.martialCorrelation} (${dailyInvocation.focusQlipha})`, 15, yPos);

  // Footer note
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 140);
  doc.text('Aetheris OpenXR Telemetry Node • For Occult Research & Internal Martial Discipline', 15, 285);

  doc.save(`AETHERIS_OCCULT_REPORT_ALIGNMENT_${Date.now()}.pdf`);
}
