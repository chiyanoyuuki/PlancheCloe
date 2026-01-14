import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getDocument } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as DATA from '../../public/data.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  type = 'forfaits';
  types = ['forfaits'];
  lang = 'fr';
  services: any = DATA.services;
  textes: any = DATA.textes;
  phrase: any = DATA.phrase;
  titres: any = DATA.titres;

  ngOnInit() {}

  generatePDFfromHTML() {
    const element = document.getElementById('htmlContent');

    html2canvas(element!, { scale: 4 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // Largeur en mm pour A4
      const pageHeight = 297; // Hauteur pour A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      pdf.save(
        'Plaquette Tarifaire 2025 ' + (this.lang == 'fr' ? 'FR' : 'EN') + '.pdf'
      );
    });
  }

  trackByIndex(index: number) {
    return index;
  }

  generatePDFfromHTMLPaysage() {
    const element = document.getElementById('htmlContent');

    html2canvas(element!, { scale: 4 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF('l', 'mm', 'a4');

      const imgWidth = 297; // Largeur en mm pour A4
      const pageHeight = 210; // Hauteur pour A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      pdf.save(
        'Plaquette Tarifaire 2025 ' + (this.lang == 'fr' ? 'FR' : 'EN') + '.pdf'
      );
    });
  }

  generateJPGfromHTML() {
    const element = document.getElementById('htmlContent');

    html2canvas(element!, { scale: 4 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0); // Convertir en image JPG (qualité 100%)

      const link = document.createElement('a');
      link.href = imgData;
      link.download =
        'Plaquette Tarifaire 2025 ' +
        (this.lang == 'fr' ? 'FR' : 'EN') +
        '.jpg';
      link.click();
    });
  }

  deltxt(i: any) {
    this.textes[this.lang].splice(i, 1);
  }

  addtxt() {
    this.textes[this.lang].push('');
  }
}
