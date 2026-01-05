
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "DMCA Policy | Print Brawl",
    description: "Digital Millennium Copyright Act Notice and Takedown Procedure.",
};

export default function DMCAPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container-width max-w-4xl px-6">
                <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">DMCA Policy</h1>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="lead text-lg">
                            Digital Millennium Copyright Act Notice
                        </p>
                        <p>
                            Print Brawl respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement committed using the Print Brawl service.
                        </p>

                        <h3>1. Filing a Takedown Notice</h3>
                        <p>
                            If you are a copyright owner, or are authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to our Designated Copyright Agent.
                        </p>
                        <p>
                            Upon receipt of the Notice as described below, Print Brawl will take whatever action, in its sole discretion, it deems appropriate, including removal of the challenged material from the Site.
                        </p>

                        <h4>Notice Requirements</h4>
                        <ul>
                            <li>Identify the copyrighted work that you claim has been infringed.</li>
                            <li>Identify the material that you claim is infringing (or to be the subject of infringing activity) and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material (e.g., a URL).</li>
                            <li>Provide your mailing address, telephone number, and, if available, email address.</li>
                            <li>Include both of the following statements in the body of the Notice:
                                <ul>
                                    <li>"I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)."</li>
                                    <li>"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</li>
                                </ul>
                            </li>
                            <li>Provide your full legal name and your electronic or physical signature.</li>
                        </ul>

                        <h3>2. Counter-Notice Procedure</h3>
                        <p>
                            If you believe that your content that was removed (or to which access was disabled) is not infringing, or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant to the law, to post and use the material in your content, you may send a Counter-Notice containing the following information to our Copyright Agent:
                        </p>
                        <ul>
                            <li>Your physical or electronic signature.</li>
                            <li>Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled.</li>
                            <li>A statement that you have a good faith belief that the content was removed or disabled as a result of mistake or a misidentification of the content.</li>
                            <li>Your name, address, telephone number, and email address.</li>
                        </ul>

                        <h3>3. Designated Copyright Agent</h3>
                        <p>
                            All DMCA Notices and Counter-Notices should be sent to our Designated Copyright Agent:
                        </p>
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 not-prose">
                            <p className="font-bold text-slate-900">Copyright Agent</p>
                            <p>Print Brawl Legal Dept.</p>
                            <p>123 Print St, Creative City, NY 10012</p>
                            <p>Email: <a href="mailto:copyright@printbrawl.com" className="text-indigo-600 hover:underline">copyright@printbrawl.com</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
