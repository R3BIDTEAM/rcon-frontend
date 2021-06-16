'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">base documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' : 'data-target="#xs-components-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' :
                                            'id="xs-components-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' }>
                                            <li class="link">
                                                <a href="components/AltaContribuyenteComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AltaContribuyenteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AltaNotarioComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AltaNotarioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AltaPeritosComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AltaPeritosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AltaSociedadComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AltaSociedadComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConsultaContribuyenteComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ConsultaContribuyenteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConsultaNotarioComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ConsultaNotarioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConsultaPeritosComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ConsultaPeritosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConsultaSociedadComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ConsultaSociedadComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogAltaBusca.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogAltaBusca</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogAsentamiento.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogAsentamiento</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogAsentamientoAlta.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogAsentamientoAlta</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogAsentamientoContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogAsentamientoContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogAsentamientoNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogAsentamientoNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogAsentamientoSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogAsentamientoSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogBuscaPerito.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogBuscaPerito</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogBuscaSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogBuscaSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogBuscarNotarioAlta.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogBuscarNotarioAlta</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogCiudad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogCiudad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogCiudadAlta.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogCiudadAlta</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogCiudadContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogCiudadContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogCiudadNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogCiudadNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogCiudadSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogCiudadSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDocumentoAltaC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDocumentoAltaC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDocumentoC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDocumentoC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDocumentoPerito.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDocumentoPerito</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDocumentoSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDocumentoSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioAlta.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioAlta</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoEspecificoContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoEspecificoContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoEspecificoNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoEspecificoNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoEspecificoPerito.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoEspecificoPerito</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoEspecificoSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoEspecificoSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoPerito.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoPerito</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioHistoricoSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioHistoricoSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioPerito.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioPerito</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomicilioSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomicilioSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDomiciliosNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDomiciliosNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogDuplicadosComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogDuplicadosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogHistorialRep.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogHistorialRep</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogHistorialRepC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogHistorialRepC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogHistorialRepDetalle.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogHistorialRepDetalle</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogHistorialRepDetalleC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogHistorialRepDetalleC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogHistorialRepDetalleS.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogHistorialRepDetalleS</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogHistorialRepS.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogHistorialRepS</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogMunicipios.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogMunicipios</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogMunicipiosAlta.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogMunicipiosAlta</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogMunicipiosContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogMunicipiosContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogMunicipiosNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogMunicipiosNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogMunicipiosSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogMunicipiosSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogNotarioAltaC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogNotarioAltaC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogNotarioC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogNotarioC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogNotarioPeritos.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogNotarioPeritos</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogNotarioSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogNotarioSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonaAltaC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonaAltaC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonaC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonaC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonaPeritos.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonaPeritos</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonaSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonaSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonalesHistoricoContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonalesHistoricoContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonalesHistoricoEspecificoContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonalesHistoricoEspecificoContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonalesHistoricoEspecificoNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonalesHistoricoEspecificoNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogPersonalesHistoricoNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogPersonalesHistoricoNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentacionAltaC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentacionAltaC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentacionC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentacionC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentacionPeritos.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentacionPeritos</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentacionSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentacionSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentadoAltaC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentadoAltaC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentadoC.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentadoC</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentadoPeritos.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentadoPeritos</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogRepresentadoSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogRepresentadoSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogSociedadAsociada.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogSociedadAsociada</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogSociedadPerito.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogSociedadPerito</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogVia.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogVia</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogViaAlta.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogViaAlta</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogViaContribuyente.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogViaContribuyente</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogViaNotario.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogViaNotario</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogViaSociedad.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogViaSociedad</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EdicionContribuyenteComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EdicionContribuyenteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EdicionNotarioComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EdicionNotarioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EdicionPeritosComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EdicionPeritosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EdicionSociedadComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EdicionSociedadComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditarContribuyenteComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EditarContribuyenteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditarNotarioComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EditarNotarioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditarPeritosComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EditarPeritosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditarSociedadComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">EditarSociedadComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginFirmaComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoginFirmaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MainComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VerContribuyenteComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">VerContribuyenteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VerHistoricoDomicilioNotarioComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">VerHistoricoDomicilioNotarioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VerNotarioComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">VerNotarioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VerPeritosComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">VerPeritosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VerSociedadComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">VerSociedadComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' : 'data-target="#xs-directives-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' :
                                        'id="xs-directives-links-module-AppModule-f8b2b24274c070a9779d2a5f2cc1ed0a"' }>
                                        <li class="link">
                                            <a href="directives/CardElevationDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">CardElevationDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MaterialModule.html" data-type="entity-link">MaterialModule</a>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link">AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EfirmaService.html" data-type="entity-link">EfirmaService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/GuardService.html" data-type="entity-link">GuardService</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthData.html" data-type="entity-link">AuthData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Certificado.html" data-type="entity-link">Certificado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataActualizacion.html" data-type="entity-link">DataActualizacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataAsentamiento.html" data-type="entity-link">DataAsentamiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataAsentamiento-1.html" data-type="entity-link">DataAsentamiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataAsentamiento-2.html" data-type="entity-link">DataAsentamiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataAsentamiento-3.html" data-type="entity-link">DataAsentamiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataAsentamiento-4.html" data-type="entity-link">DataAsentamiento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataCiudad.html" data-type="entity-link">DataCiudad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataCiudad-1.html" data-type="entity-link">DataCiudad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataCiudad-2.html" data-type="entity-link">DataCiudad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataCiudad-3.html" data-type="entity-link">DataCiudad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataCiudad-4.html" data-type="entity-link">DataCiudad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDocumentoRepresentacion.html" data-type="entity-link">DataDocumentoRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDocumentoRepresentacion-1.html" data-type="entity-link">DataDocumentoRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDocumentoRepresentacion-2.html" data-type="entity-link">DataDocumentoRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDocumentoRepresentacion-3.html" data-type="entity-link">DataDocumentoRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDomicilio.html" data-type="entity-link">DataDomicilio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDomicilio-1.html" data-type="entity-link">DataDomicilio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDomicilio-2.html" data-type="entity-link">DataDomicilio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDomicilio-3.html" data-type="entity-link">DataDomicilio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataDomicilio-4.html" data-type="entity-link">DataDomicilio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistorico.html" data-type="entity-link">DataHistorico</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistorico-1.html" data-type="entity-link">DataHistorico</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistorico-2.html" data-type="entity-link">DataHistorico</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistorico-3.html" data-type="entity-link">DataHistorico</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistoricoRep.html" data-type="entity-link">DataHistoricoRep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistoricoRep-1.html" data-type="entity-link">DataHistoricoRep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistoricoRep-2.html" data-type="entity-link">DataHistoricoRep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistoricoRep-3.html" data-type="entity-link">DataHistoricoRep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistoricoRep-4.html" data-type="entity-link">DataHistoricoRep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataHistoricoRep-5.html" data-type="entity-link">DataHistoricoRep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataMovimientoDomicilio.html" data-type="entity-link">DataMovimientoDomicilio</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataMunicipios.html" data-type="entity-link">DataMunicipios</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataMunicipios-1.html" data-type="entity-link">DataMunicipios</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataMunicipios-2.html" data-type="entity-link">DataMunicipios</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataMunicipios-3.html" data-type="entity-link">DataMunicipios</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataMunicipios-4.html" data-type="entity-link">DataMunicipios</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataNotarioSeleccionado.html" data-type="entity-link">DataNotarioSeleccionado</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataRepresentacion.html" data-type="entity-link">DataRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataRepresentacion-1.html" data-type="entity-link">DataRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataRepresentacion-2.html" data-type="entity-link">DataRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataRepresentacion-3.html" data-type="entity-link">DataRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataRepresentacion-4.html" data-type="entity-link">DataRepresentacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSociedadAsociada.html" data-type="entity-link">DataSociedadAsociada</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataSociedadAsociadaDialog.html" data-type="entity-link">DataSociedadAsociadaDialog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/dataVia.html" data-type="entity-link">dataVia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/dataVia-1.html" data-type="entity-link">dataVia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/dataVia-2.html" data-type="entity-link">dataVia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/dataVia-3.html" data-type="entity-link">dataVia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/dataVia-4.html" data-type="entity-link">dataVia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosContribuyente.html" data-type="entity-link">DatosContribuyente</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosContribuyente-1.html" data-type="entity-link">DatosContribuyente</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosGenerales.html" data-type="entity-link">DatosGenerales</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosNotario.html" data-type="entity-link">DatosNotario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosNotario-1.html" data-type="entity-link">DatosNotario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosPeritoPersona.html" data-type="entity-link">DatosPeritoPersona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosPeritoPersona-1.html" data-type="entity-link">DatosPeritoPersona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosPeritoPersona-2.html" data-type="entity-link">DatosPeritoPersona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosPeritos.html" data-type="entity-link">DatosPeritos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosPeritos-1.html" data-type="entity-link">DatosPeritos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosPeritos-2.html" data-type="entity-link">DatosPeritos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosSociedad.html" data-type="entity-link">DatosSociedad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosSociedad-1.html" data-type="entity-link">DatosSociedad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatosSociedadPersona.html" data-type="entity-link">DatosSociedadPersona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DireccionesNotario.html" data-type="entity-link">DireccionesNotario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DireccionesNotario-1.html" data-type="entity-link">DireccionesNotario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-1.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-2.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-3.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-4.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-5.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-6.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-7.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-8.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-9.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentosIdentificativos-10.html" data-type="entity-link">DocumentosIdentificativos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estados.html" data-type="entity-link">Estados</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estados-1.html" data-type="entity-link">Estados</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estados-2.html" data-type="entity-link">Estados</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estados-3.html" data-type="entity-link">Estados</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estados-4.html" data-type="entity-link">Estados</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-1.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-2.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-3.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-4.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-5.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-6.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-7.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-8.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-9.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filtros-10.html" data-type="entity-link">Filtros</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Notario.html" data-type="entity-link">Notario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Notario-1.html" data-type="entity-link">Notario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Notario-2.html" data-type="entity-link">Notario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Notario-3.html" data-type="entity-link">Notario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Persona.html" data-type="entity-link">Persona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Persona-1.html" data-type="entity-link">Persona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Persona-2.html" data-type="entity-link">Persona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Persona-3.html" data-type="entity-link">Persona</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SociedadDialog.html" data-type="entity-link">SociedadDialog</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});