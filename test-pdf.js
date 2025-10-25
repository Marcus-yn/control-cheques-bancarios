// Prueba simple de PDF para verificar funcionalidad
import jsPDF from 'jspdf';

function testPDF() {
  try {
    console.log('🧪 Iniciando prueba de PDF...');
    
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('PRUEBA DE PDF - CONTROL DE CHEQUES', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Esta es una prueba simple de generación de PDF', 20, 50);
    pdf.text('Fecha: ' + new Date().toLocaleDateString('es-GT'), 20, 60);
    
    pdf.save('prueba-pdf.pdf');
    console.log('✅ PDF generado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
  }
}

// Para usar en el navegador
window.testPDF = testPDF;

console.log('📄 Script de prueba PDF cargado. Usa testPDF() en la consola.');